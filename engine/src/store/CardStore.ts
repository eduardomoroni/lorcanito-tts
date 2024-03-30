import { Dependencies } from "@lorcanito/engine/store/types";
import {
  type MobXRootStore,
  MoveResponse,
} from "@lorcanito/engine/store/RootStore";

import { makeAutoObservable, toJS } from "mobx";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";
import type { Game, Meta, Zones } from "@lorcanito/engine/types";
import { applyAllCardFilters } from "@lorcanito/engine/filter/filterPredicates";
import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";
import { CardMetaModel } from "@lorcanito/engine/store/models/CardMetaModel";

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
        this.getCard(instanceId)?.sync(card);
      } else {
        this.rootStore.debug("[SYNC] Card not found", instanceId);
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
      console.error("Card not found: ", instanceId);
      return undefined;
    }

    const card = this.cards[instanceId];

    if (!card) {
      console.error("Card not found: ", instanceId);
      return undefined;
    }

    return card;
  }

  // TODO: get all cards could be all cards in game, and not the full set of cards
  getAllCards() {
    return Object.values(this.cards || {});
  }

  get characterCardsInPlay() {
    const charsInPlay: TargetFilter[] = [
      { filter: "zone", value: ["play"] },
      { filter: "type", value: "character" },
    ];
    return this.rootStore.cardStore.getCardsByFilter(charsInPlay);
  }

  getCardsByFilter(
    filters?: TargetFilter[],
    responder?: string,
    source?: CardModel,
  ): CardModel[] {
    // TODO: No filters means no cards
    if (!filters) {
      return [];
    }

    // TODO: We can optimize this getAllCards
    return this.getAllCards().filter(
      this.isValidCardTargetPredicate(filters, responder, source),
    );
  }

  isValidCardTargetPredicate(
    filters?: TargetFilter[],
    player?: string,
    source?: CardModel,
  ) {
    // TODO: No filters means no cards
    if (!filters) {
      return () => false;
    }

    return applyAllCardFilters(
      filters,
      player || this.rootStore.activePlayer,
      this.rootStore,
      source,
    );
  }

  updateCardMeta(instanceId: string, meta: Partial<CardMetaModel>) {
    const card = this.cards[instanceId];

    if (!card) {
      this.rootStore.debug("[updateCardMeta] card not found", instanceId);
      return;
    }

    card.updateCardMeta(meta);
  }

  // todo: move this to cardModel
  // TODO: combine this with CardModel.play
  shiftCard(shifter: string, shifted: string): MoveResponse {
    const {
      logger,
      notifier: { sendNotification },
    } = this.dependencies;
    const card = this.cards[shifter];
    const toShift = this.cards[shifted];
    const table = this.rootStore.tableStore.getTable(card?.ownerId);

    if (!card || !card.hasShift || !toShift || !table) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Shift Card not found",
        message: `Card not found`,
        icon: "warning",
        autoClear: true,
      });

      return this.rootStore.moveResponse(false);
    }

    const canPay = table?.canPayInkCost(card, { shift: card.shiftCost });

    // TODO: CHECK IF SHIFT IS POSSIBLE
    if (!canPay) {
      sendNotification({
        type: "icon",
        title: "Not enough ink",
        message: `You can drag the card from hand on top of the card you want to shift, to skip paying costs.`,
        icon: "warning",
        autoClear: true,
      });
      return this.rootStore.moveResponse(false);
    }

    this.rootStore.tableStore.payInk(table, card.shiftCost);
    this.rootStore.tableStore.moveCard(shifter, "play");

    const shiftedMeta = toShift.meta || {};
    const combinedMeta = {
      ...shiftedMeta,
      shifter,
      shifted,
    };

    toShift.updateCardMeta(combinedMeta);
    card.updateCardMeta(combinedMeta);

    logger.log({ type: "SHIFT", shifter, shifted });

    return card.onPlay({ hasShifted: true });
  }

  singCard(song: CardModel, singer: CardModel) {
    singer.sing(song);
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
      this.rootStore.debug("[updateCardDamage] card not found", instanceId);
      return;
    }

    card.updateCardDamage(amount, type);
  }

  tapCard(
    instanceId: string,
    opts: {
      exerted?: boolean;
      toggle?: boolean;
    },
  ): MoveResponse {
    const { logger } = this.dependencies;
    const { exerted, toggle } = opts;

    const card = this.cards[instanceId];

    if (!card) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Card not found",
        message: `Card not found`,
        icon: "warning",
        autoClear: true,
      });
      return this.rootStore.moveResponse(false);
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

    return this.rootStore.moveResponse(true);
  }

  revealCard(instanceId: string, from: Zones): MoveResponse {
    const { logger } = this.dependencies;

    const card = this.cards[instanceId];

    this.updateCardMeta(instanceId, { revealed: true });

    logger.log({
      type: "REVEAL_CARD",
      card: instanceId,
      from,
      player: card?.ownerId || "",
    });
    return this.rootStore.moveResponse(true);
  }

  quest(instanceId: string) {
    const card = this.cards[instanceId];

    if (!instanceId || !card) {
      this.rootStore.debug("Card not found", instanceId);
      return;
    }

    card.quest();
  }

  shuffleCardIntoDeck(instanceId: string) {
    const card = this.cards[instanceId];

    if (!instanceId || !card) {
      this.rootStore.debug("Card not found", instanceId);
      return;
    }

    this.rootStore.tableStore.moveCard(instanceId, "deck");
    this.rootStore.tableStore.shuffleDeck(card.ownerId);

    // this.rootStore.log({ type: "SHUFFLE_CARD_INTO_DECK" });
    this.rootStore.log({
      type: "SHUFFLE_CARD",
      instanceId: instanceId,
    });
  }
}
