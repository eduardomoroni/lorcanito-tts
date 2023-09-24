import { MobXRootStore } from "~/store/RootStore";
import { Dependencies } from "~/store/types";
import {
  createMockGame,
  TestInitialState,
} from "~/engine/__mocks__/createGameMock";
import type { Zones } from "~/providers/TabletopProvider";
import { dingleHopper } from "~/engine/cards/TFC/items/items";
import { LorcanitoCard } from "~/engine/cards/cardTypes";
import { friendsOnTheOtherSide } from "~/engine/cards/TFC/songs/songs";
import type { ResolvingParam } from "~/store/StackLayerStore";

function noOp() {}

const deps: Dependencies = {
  logger: { log: noOp },
  notifier: {
    sendNotification: noOp,
    clearNotification: noOp,
    clearAllNotifications: noOp,
  },
  playerId: "player_one",
  modals: {
    openYesOrNoModal: noOp,
    openTargetModal: noOp,
    openScryModal: noOp,
  },
};

export class TestStore {
  store: MobXRootStore;
  constructor(
    playerState: TestInitialState = {},
    opponentState: TestInitialState = {},
  ) {
    const game = createMockGame(playerState, opponentState);
    this.store = new MobXRootStore(game, deps);
  }

  getByZoneAndId(zone: Zones, id: string, playerId = "player_one") {
    const card = this.store.tableStore
      .getPlayerZone(playerId, zone)
      ?.cards.find((card) => card.lorcanitoCard?.id === id);

    if (!card) {
      throw new Error(`Could not find card with id ${id} in zone ${zone}`);
    }

    return card;
  }

  getZonesCardCount(playerId = "player_one") {
    const tableStore = this.store.tableStore;
    return {
      inkwell: tableStore.getPlayerZoneCards(playerId, "inkwell").length,
      hand: tableStore.getPlayerZoneCards(playerId, "hand").length,
      play: tableStore.getPlayerZoneCards(playerId, "play").length,
      discard: tableStore.getPlayerZoneCards(playerId, "discard").length,
      deck: tableStore.getPlayerZoneCards(playerId, "deck").length,
    };
  }

  resolveTopOfStack(params: ResolvingParam = {}) {
    const effect = this.store.stackLayerStore.layers[0];
    if (effect) {
      // TODO: We could receive CardModel instead of an instanceId
      effect.resolve(params);
    } else {
      throw new Error("No effect to resolve");
    }
  }

  passTurn(force = false) {
    this.store.passTurn(this.store.turnPlayer, force);
  }

  static get aCard(): LorcanitoCard {
    return dingleHopper;
  }

  static get aSongCard(): LorcanitoCard {
    return friendsOnTheOtherSide;
  }
}
