import { CardModel } from "~/store/models/CardModel";
import { Table, TableZones, Zones } from "~/providers/TabletopProvider";
import { ZoneModel } from "~/store/models/ZoneModel";
import { CardStore } from "~/store/CardStore";
import { makeAutoObservable, values } from "mobx";
import { MobXRootStore } from "~/store/RootStore";
// import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";

export class TableModel {
  zones: Record<Zones, ZoneModel>;
  ownerId: string;
  lore: number;
  readyToStart?: boolean;
  private rootStore: MobXRootStore;

  constructor(
    zones: Record<Zones, ZoneModel>,
    ownerId: string,
    lore: number,
    readyToStart: boolean = false,
    rootStore: MobXRootStore
  ) {
    makeAutoObservable<TableModel, "rootStore">(this, {
      rootStore: false,
    });

    this.zones = zones;
    this.ownerId = ownerId;
    this.lore = lore;
    this.readyToStart = readyToStart;

    this.rootStore = rootStore;
  }

  sync(table: Table) {
    this.lore = table.lore;
    this.readyToStart = table.readyToStart;
    values(this.zones).forEach((zone) => zone.sync(table.zones[zone.zone]));
  }

  static fromTable(
    table: Table,
    ownerId: string,
    cardStore: CardStore,
    rootStore: MobXRootStore
  ): TableModel {
    const zones: Record<Zones, ZoneModel> = {
      hand: new ZoneModel(
        "hand",
        (table.zones?.hand
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore
      ),
      play: new ZoneModel(
        "play",
        (table.zones?.play
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore
      ),
      discard: new ZoneModel(
        "discard",
        (table.zones?.discard
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore
      ),
      deck: new ZoneModel(
        "deck",
        (table.zones?.deck
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore
      ),
      inkwell: new ZoneModel(
        "inkwell",
        (table.zones?.inkwell
          ?.map((cardId) => cardStore.cards[cardId])
          .filter(Boolean) as CardModel[]) ?? [],
        ownerId,
        rootStore
      ),
    };

    return new TableModel(
      zones,
      ownerId,
      table.lore,
      table.readyToStart,
      rootStore
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
    };
  }

  dispose() {
    console.log("Disposing table", this.ownerId);
  }

  cardsAddedToInkWellThisTurn() {
    return this.zones.inkwell.cards.filter((card) => card.meta?.playedThisTurn)
      .length;
  }

  // TODO: We should check here cost reduction, and that items pays costs
  canPayInkCost(
    card: CardModel,
    params: { shift?: number; byPass?: number } = {}
  ) {
    // TODO: this is complete garbage, fix this
    const cost = params.byPass || params.shift || card.lorcanitoCard.cost;
    const inkAvailable = this.zones.inkwell.cards.filter(
      (card) => !card.meta?.exerted
    );

    return inkAvailable.length >= cost;
  }

  inkAvailable() {
    return this.zones.inkwell.inkAvailable();
  }

  moveCard(
    card: CardModel,
    from: Zones,
    to: Zones,
    position: "first" | "last" = "last"
  ) {
    // const { logger } = this.dependencies;

    if (from === to && from !== "deck") {
      console.log("Moving same zone", from, to);
      return;
    }

    const shifted = this.zones.play.cards.find(
      (card) => card.meta?.shifted === card.instanceId
    );
    if (shifted && shifted.instanceId !== card.instanceId) {
      this.moveCard(shifted, from, "discard", "last");
    }

    const fromZone = this.zones[from];

    if (!fromZone.hasCard(card)) {
      console.log("Card not found in zone", from, card.instanceId);
      return;
    }

    fromZone.removeCard(card);
    this.zones[to].addCard(card, position);
    this.removeDuplicates(card, to);

    if (["play", "inkwell"].includes(to)) {
      card.meta.update({
        playedThisTurn: true,
      });
    } else {
      card.meta.resetMeta();
    }

    // logger.log(
    //   createLogEntry(
    //     {
    //       type: "MOVE_CARD",
    //       instanceId,
    //       from,
    //       to,
    //       position,
    //       owner,
    //     },
    //     owner
    //   )
    // );
    // logAnalyticsEvent("move_card", { from, to });
  }

  removeDuplicates(card: CardModel, ignoreZone: Zones) {
    (Object.keys(this.zones || {}) as Zones[]).forEach((zone) => {
      const aZone = this.zones[zone];

      if (zone !== ignoreZone && aZone.hasCard(card)) {
        aZone.removeCard(card);

        console.log("Removing duplicates!!! ", zone, card.instanceId);
        // logAnalyticsEvent("remove_duplicates", {
        //   zone,
        //   instanceId: card.instanceId,
        // });
      }
    });
  }
}
