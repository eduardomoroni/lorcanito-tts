import { Dependencies } from "~/engine/store/types";
import { Meta, Zones } from "~/spaces/providers/TabletopProvider";
import { type MobXRootStore } from "~/engine/store/RootStore";
import { Game } from "~/libs/game";
import { makeAutoObservable, toJS } from "mobx";
import { CardModel } from "~/engine/store/models/CardModel";
import { applyAllCardFilters } from "~/spaces/components/modals/target/filterPredicates";
import {
  challengeOpponentsCardsFilter,
  TargetFilter,
} from "~/spaces/components/modals/target/filters";
import { shiftAbilityPredicate } from "~/engine/rules/abilities/abilities";

export class CardStore {
  dependencies: Dependencies;
  cards: Record<string, CardModel>;
  rootStore: MobXRootStore;

  constructor(
    initialState: Game["cards"] = {},
    dependencies: Dependencies,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    this.rootStore = rootStore;
    this.dependencies = dependencies;
    this.cards = {};

    Object.keys(initialState).forEach((instanceId) => {
      const card = initialState[instanceId];

      if (card) {
        this.cards[instanceId] = new CardModel(
          instanceId,
          card.cardId,
          card.meta,
          card.ownerId,
          // I'm not sure if this is a good idea
          this.rootStore,
          observable,
        );
      }
    });

    if (observable) {
      makeAutoObservable(this, { rootStore: false, dependencies: false });
    }
  }

  // TODO: should we sync each individual card?
  sync(cards: Game["cards"]) {
    Object.keys(cards || {}).forEach((instanceId) => {
      const card = cards[instanceId];
      if (this.hasCard(instanceId) && card) {
        this.getCard(instanceId).sync(card);
      } else {
        console.log("[SYNC] Card not found", instanceId);
      }
    });
  }

  toJSON(): Game["cards"] {
    const cards: Game["cards"] = {};

    Object.keys(this.cards).forEach((instanceId) => {
      const card = this.cards[instanceId];
      if (card) {
        cards[instanceId] = card.toJSON();
      }
    });

    return toJS(cards);
  }

  hasCard(instanceId?: string) {
    if (!instanceId) {
      return false;
    }
    return !!this.cards[instanceId];
  }

  getCard(instanceId?: string) {
    if (!instanceId) {
      throw Error("Card Not Found: " + instanceId);
    }

    const card = this.cards[instanceId];

    if (!card) {
      console.log(JSON.stringify(instanceId));
      throw Error("Card Not Found " + instanceId);
    }

    return card;
  }

  getAllCards() {
    return Object.values(this.cards || {});
  }

  getCardsByFilter(filters?: TargetFilter[], player?: string): CardModel[] {
    // TODO: No filters means no cards
    if (!filters) {
      return [];
    }

    const cards = this.getAllCards();
    return cards.filter(
      applyAllCardFilters(
        filters,
        player || this.rootStore.activePlayer,
        this.rootStore,
      ),
    );
  }

  updateCardMeta(instanceId: string, meta: Partial<Meta>) {
    const card = this.cards[instanceId];

    if (!card) {
      console.log("[updateCardMeta] card not found", instanceId);
      return;
    }

    card.updateCardMeta(meta);
  }

  // todo: move this to cardModel
  shiftCard(shifter: string, shifted: string) {
    const {
      logger,
      notifier: { sendNotification },
    } = this.dependencies;
    const card = this.cards[shifter];
    const toShift = this.cards[shifted];
    const table = this.rootStore.tableStore.getTable(card?.ownerId);

    if (!card || !card.hasShift || !toShift || !table) {
      console.log("[shiftCard] card not found", shifter, table);
      return;
    }

    const canPay = table?.canPayInkCost(card, { shift: card.shiftCost });

    // TODO: CHECK IF SHIFT IS POSSIBLE
    if (canPay) {
      this.rootStore.tableStore.payInk(table, card, { shift: card.shiftCost });
      this.rootStore.tableStore.moveCard(shifter, "hand", "play");

      const shiftedMeta = toShift.meta || {};
      const combinedMeta = {
        ...shiftedMeta,
        shifter,
        shifted,
      };

      toShift.updateCardMeta(combinedMeta);
      card.updateCardMeta(combinedMeta);
      // logAnalyticsEvent("shift");
      logger.log({ type: "SHIFT", shifter, shifted });

      // TODO: WE HAVE TO DO THIS PROPERLY
      this.rootStore.stackLayerStore.onPlay(card);
      this.rootStore.triggeredStore.onPlay(card);
      this.rootStore.continuousEffectStore.onPlay(card);
    } else {
      sendNotification({
        type: "icon",
        title: "Not enough ink",
        message: `You can drag the card from hand on top of the card you want to shift, to skip paying costs.`,
        icon: "warning",
        autoClear: true,
      });
    }
  }

  singCard(song: CardModel, singer: CardModel) {
    singer.sing(song);
  }

  openChallengeModal(challenger: CardModel) {
    this.dependencies.modals.openTargetModal({
      filters: challengeOpponentsCardsFilter,
      callback: (target?: CardModel) => {
        if (target) {
          this.challenge(challenger.instanceId, target.instanceId);
        }
      },
      type: "challenge",
      title: `Choose a glimmer to challenge with`,
    });
  }

  openShiftModal(shifter: CardModel) {
    const lorcanitoCard = shifter.lorcanitoCard;
    const shiftAbility = lorcanitoCard?.abilities?.find(shiftAbilityPredicate);

    this.dependencies.modals.openTargetModal({
      title: `Choose a card to shift`,
      subtitle: shiftAbility?.text,
      filters: [
        { filter: "zone", value: "play" },
        { filter: "type", value: "character" },
        { filter: "owner", value: "self" },
        {
          filter: "attribute",
          value: "name",
          comparison: {
            operator: "eq",
            value: lorcanitoCard?.name || "",
          },
        },
      ],
      callback: (card?: CardModel) => {
        if (card) {
          this.shiftCard(card.instanceId, card.instanceId);
        }
      },
    });
  }

  challenge(attackerId?: string, defenderId?: string) {
    const attacker = this.cards[attackerId || ""];
    const defender = this.cards[defenderId || ""];
    if (!attacker || !defender || !attackerId || !defenderId) {
      console.error("attackerId or defenderId is undefined");
      return;
    }

    attacker.challenge(defender);
  }

  updateCardDamage(
    instanceId: string,
    amount: number,
    type: "add" | "remove" = "add",
  ) {
    const card = this.cards[instanceId];

    if (!card) {
      console.log("[updateCardDamage] card not found", instanceId);
      return;
    }

    card.updateCardDamage(amount, type);
  }

  tapCard(
    instanceId: string,
    opts: {
      exerted?: boolean;
      toggle?: boolean;
      cardId?: string;
      inkwell?: boolean;
    },
  ) {
    const { logger } = this.dependencies;
    const { exerted, toggle, cardId } = opts;

    const card = this.cards[instanceId];

    if (!card) {
      console.log("[tapCard] card not found", instanceId);
      return;
    }

    if (toggle) {
      this.updateCardMeta(instanceId, { exerted: !card.meta?.exerted });
    } else {
      this.updateCardMeta(instanceId, { exerted: exerted || true });
    }

    logger.log({
      type: "TAP",
      instanceId,
      value: card.meta?.exerted || false,
      inkwell: this.rootStore.tableStore
        .getTable(card.ownerId)
        ?.zones.inkwell.hasCard(card),
    });
    // logAnalyticsEvent("tap_card", { instanceId, exerted, inkwell });
  }

  revealCard(instanceId: string, from: Zones) {
    const { logger } = this.dependencies;

    const card = this.cards[instanceId];

    this.updateCardMeta(instanceId, { revealed: true });

    logger.log({
      type: "REVEAL_CARD",
      card: instanceId,
      from,
      player: card?.ownerId || "",
    });
    // logAnalyticsEvent("reveal_card");
  }

  quest(instanceId: string) {
    const card = this.cards[instanceId];

    if (!instanceId || !card) {
      console.log("Card not found", instanceId);
      return;
    }

    card.quest();
  }

  shuffleCardIntoDeck(instanceId: string, from: Zones) {
    const card = this.cards[instanceId];

    if (!instanceId || !card) {
      console.log("Card not found", instanceId);
      return;
    }

    this.rootStore.tableStore.moveCard(instanceId, from, "deck", "last");
    this.rootStore.tableStore.shuffleDeck(card.ownerId);

    // this.rootStore.log({ type: "SHUFFLE_CARD_INTO_DECK" });
    this.rootStore.log({
      type: "SHUFFLE_CARD",
      instanceId: instanceId,
    });
  }
}
