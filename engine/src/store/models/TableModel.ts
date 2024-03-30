import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import { ZoneModel } from "@lorcanito/engine/store/models/ZoneModel";
import type { CardStore } from "@lorcanito/engine/store/CardStore";
import { makeAutoObservable } from "mobx";
import type {
  MobXRootStore,
  MoveResponse,
} from "@lorcanito/engine/store/RootStore";
import { notEmptyPredicate } from "@lorcanito/engine/rules/abilities/abilityTypeGuards";
import { createLogEntry } from "@lorcanito/engine/CreateLogEntry";
import type { Table, TableZones, Zones } from "@lorcanito/engine/types";

export type Turn = {
  cardsAddedToInkWell: CardModel[];
  cardsPlayed: CardModel[];
  cardsDiscarded: CardModel[];
  challenges: Array<{ attacker: CardModel; defender: CardModel }>;
};

export class TableModel {
  zones: Record<Zones, ZoneModel>;
  ownerId: string;
  lore: number;
  readyToStart?: boolean;
  turn: Turn;
  private rootStore: MobXRootStore;

  constructor(
    zones: Record<Zones, ZoneModel>,
    ownerId: string,
    lore: number,
    turn: Turn,
    readyToStart: boolean = false,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    if (observable) {
      makeAutoObservable<TableModel, "rootStore">(this, {
        rootStore: false,
      });
    }

    this.zones = zones;
    this.ownerId = ownerId;
    this.lore = lore;
    this.readyToStart = readyToStart;
    this.turn = turn;

    this.rootStore = rootStore;
  }

  sync(table: Table) {
    this.lore = table.lore;
    this.readyToStart = table.readyToStart;
    this.turn = {
      cardsAddedToInkWell: table.turn.cardsAddedToInkWell
        .map((cardId) => this.rootStore.cardStore.cards[cardId])
        .filter(notEmptyPredicate),
      cardsPlayed: table.turn.cardsPlayed
        .map((cardId) => this.rootStore.cardStore.cards[cardId])
        .filter(notEmptyPredicate),
      cardsDiscarded: table.turn.cardsDiscarded
        .map((cardId) => this.rootStore.cardStore.cards[cardId])
        .filter(notEmptyPredicate),
      challenges: table.turn.challenges
        .map((challenge) => {
          const attacker = this.rootStore.cardStore.cards[challenge.attacker];
          const defender = this.rootStore.cardStore.cards[challenge.defender];

          if (!attacker || !defender) {
            return undefined;
          }

          return {
            attacker: attacker,
            defender: defender,
          };
        })
        .filter(notEmptyPredicate),
    };
    Object.values(this.zones).forEach((zone) =>
      zone.sync(table.zones[zone.zone]),
    );
  }

  static fromTable(
    table: Table,
    ownerId: string,
    cardStore: CardStore,
    rootStore: MobXRootStore,
    observable = false,
  ): TableModel {
    const zones: Record<Zones, ZoneModel> = {
      hand: new ZoneModel(
        "hand",
        (table.zones?.hand
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore,
        observable,
      ),
      play: new ZoneModel(
        "play",
        (table.zones?.play
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore,
        observable,
      ),
      discard: new ZoneModel(
        "discard",
        (table.zones?.discard
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore,
        observable,
      ),
      deck: new ZoneModel(
        "deck",
        (table.zones?.deck
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore,
        observable,
      ),
      inkwell: new ZoneModel(
        "inkwell",
        (table.zones?.inkwell
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore,
        observable,
      ),
    };

    const turnModel = {
      cardsAddedToInkWell: table.turn.cardsAddedToInkWell
        .map((cardId) => rootStore.cardStore.cards[cardId])
        .filter(notEmptyPredicate),
      cardsPlayed: table.turn.cardsPlayed
        .map((cardId) => rootStore.cardStore.cards[cardId])
        .filter(notEmptyPredicate),
      cardsDiscarded: table.turn.cardsDiscarded
        .map((cardId) => rootStore.cardStore.cards[cardId])
        .filter(notEmptyPredicate),
      challenges: table.turn.challenges
        .map((challenge) => {
          const attacker = rootStore.cardStore.cards[challenge.attacker];
          const defender = rootStore.cardStore.cards[challenge.defender];

          if (!attacker || !defender) {
            return undefined;
          }

          return {
            attacker: attacker,
            defender: defender,
          };
        })
        .filter(notEmptyPredicate),
    };

    return new TableModel(
      zones,
      ownerId,
      table.lore,
      turnModel,
      table.readyToStart,
      rootStore,
      observable,
    );
  }

  toJSON(): Table {
    const tableZones: TableZones = {
      hand: this.zones.hand.toJSON() || [],
      play: this.zones.play.toJSON() || [],
      discard: this.zones.discard.toJSON() || [],
      deck: this.zones.deck.toJSON() || [],
      inkwell: this.zones.inkwell.toJSON() || [],
    };

    return {
      zones: tableZones,
      lore: this.lore,
      readyToStart: this.readyToStart,
      turn: {
        cardsAddedToInkWell: this.turn.cardsAddedToInkWell.map(
          (card) => card.instanceId,
        ),
        cardsPlayed: this.turn.cardsPlayed.map((card) => card.instanceId),
        cardsDiscarded: this.turn.cardsDiscarded.map((card) => card.instanceId),
        challenges: this.turn.challenges.map((challenge) => ({
          attacker: challenge.attacker.instanceId,
          defender: challenge.defender.instanceId,
        })),
      },
    };
  }

  // TODO: We should check here cost reduction, and that items pays costs
  canPayInkCost(
    card: CardModel,
    params: { shift?: number; byPass?: number } = {},
  ) {
    // TODO: this is complete garbage, fix this
    const cost = params.byPass || params.shift || card.cost;
    return this.inkAvailable() >= cost;
  }

  resetTurn() {
    this.turn = {
      cardsAddedToInkWell: [],
      cardsPlayed: [],
      cardsDiscarded: [],
      challenges: [],
    };
  }

  canAddToInkwell(): boolean {
    // TODO: Yeah I know this is hacky
    const bellesInPlay = this.zones.play.cards.filter(
      (card) => card.fullName.toLowerCase() === "belle - strange but special",
    ).length;
    const limit = bellesInPlay + 1;
    return this.turn.cardsAddedToInkWell.length < limit;
  }

  inkAvailable() {
    return this.zones.inkwell.inkAvailable();
  }

  // TODO: This is not triggering discard effect
  // prince john greediest of all, does not trigger
  moveCard(
    card: CardModel,
    to: Zones,
    position: "first" | "last" = "last",
    skipLog = false,
    discard = false,
  ): MoveResponse {
    const from = card.zone;

    if (from === to && from !== "deck") {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Moving same zone",
        message: `Moving same zone`,
        icon: "warning",
        autoClear: true,
      });
    }

    const shifted = this.zones.play.cards.find(
      (card) => card.meta?.shifted === card.instanceId,
    );
    if (shifted && shifted.instanceId !== card.instanceId) {
      this.moveCard(shifted, "discard", "last", discard);
    }

    const fromZone = this.zones[from];

    if (!fromZone.hasCard(card)) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Card not found in zone",
        message: `Card not found in zone`,
        icon: "warning",
        autoClear: true,
      });
    }

    fromZone.removeCard(card);
    this.zones[to].addCard(card, position);
    this.removeDuplicates(card, to);

    if (["play", "inkwell"].includes(to)) {
      card.updateCardMeta({
        playedThisTurn: true,
      });
    } else {
      card.meta.resetMeta();
    }

    if (!skipLog) {
      this.rootStore.log(
        createLogEntry(
          {
            type: "MOVE_CARD",
            instanceId: card.instanceId,
            from: from,
            to,
            position,
            owner: card.ownerId,
          },
          card.ownerId,
        ),
      );
    }

    return this.rootStore.moveResponse(true);
  }

  removeDuplicates(card: CardModel, ignoreZone: Zones) {
    (Object.keys(this.zones || {}) as Zones[]).forEach((zone) => {
      const aZone = this.zones[zone];

      if (zone !== ignoreZone && aZone.hasCard(card)) {
        aZone.removeCard(card);

        this.rootStore.debug("Removing duplicates!!! ", zone, card.instanceId);
        // logAnalyticsEvent("remove_duplicates", {
        //   zone,
        //   instanceId: card.instanceId,
        // });
      }
    });
  }

  updateLore(lore: number) {
    const prevLore = this.lore;
    this.lore = lore < 0 ? 0 : lore;
    return this.rootStore.log(
      createLogEntry(
        {
          type: "LORE_CHANGE",
          player: this.ownerId,
          from: prevLore,
          to: lore,
        },
        this.ownerId,
      ),
    );
  }
}
