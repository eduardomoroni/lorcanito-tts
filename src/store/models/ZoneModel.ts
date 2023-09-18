import { CardModel } from "~/store/models/CardModel";
import { Zones } from "~/providers/TabletopProvider";
import { makeAutoObservable } from "mobx";
import { MobXRootStore } from "~/store/RootStore";
import { notEmptyPredicate } from "~/engine/abilities";

export class ZoneModel {
  zone: Zones;
  cards: CardModel[];
  ownerId: string;
  private rootStore: MobXRootStore;

  constructor(
    zone: Zones,
    cards: CardModel[],
    ownerId: string,
    rootStore: MobXRootStore,
    observable: boolean
  ) {
    if (observable) {
      makeAutoObservable<ZoneModel, "rootStore">(this);
    }

    this.zone = zone;
    this.cards = cards;
    this.ownerId = ownerId;

    this.rootStore = rootStore;
  }

  sync(zone: string[] | undefined) {
    if (!zone) {
      this.cards = [];
    } else {
      this.cards = zone
        .map((cardId) => this.rootStore.cardStore.cards[cardId])
        .filter(notEmptyPredicate);
    }
  }

  toJSON(): string[] {
    if (!this.cards) {
      return [];
    }

    return this.cards.map((card) => card.instanceId);
  }

  hasCard(card: CardModel): boolean {
    return !!this.cards.find(
      (c: CardModel) => c.instanceId === card.instanceId
    );
  }

  inkAvailable(): number {
    if (this.zone !== "inkwell") {
      return 0;
    }

    return this.cards.filter((card) => !card.meta?.exerted).length;
  }

  addCard(card: CardModel, position: "last" | "first" = "last") {
    if (position === "first") {
      this.cards.unshift(card);
    } else {
      this.cards.push(card);
    }
  }

  removeCard(card: CardModel) {
    const index = this.cards.findIndex(
      (model) => model.instanceId === card.instanceId
    );
    if (index !== -1) {
      this.cards.splice(index, 1);
    }
  }
}
