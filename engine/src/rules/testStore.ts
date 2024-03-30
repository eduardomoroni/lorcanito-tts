import { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import { Dependencies } from "@lorcanito/engine/store/types";
import {
  createMockGame,
  TestInitialState,
} from "@lorcanito/engine/__mocks__/createGameMock";
import { dingleHopper } from "@lorcanito/engine/cards/TFC/items/items";
import { LorcanitoCard } from "@lorcanito/engine/cards/cardTypes";
import { friendsOnTheOtherSide } from "@lorcanito/engine/cards/TFC/songs/songs";
import type { ResolvingParam } from "@lorcanito/engine/store/StackLayerStore";
import { expect } from "@jest/globals";
import { noOpDeps } from "@lorcanito/engine/store/dependencies";
import type { Zones } from "@lorcanito/engine/types";

function noOp() {}

const debugDeps: Dependencies = {
  logger: { log: console.log },
  notifier: {
    sendNotification: console.warn,
    clearNotification: noOp,
    clearAllNotifications: noOp,
  },
  playerId: "player_one",
  modals: {
    openYesOrNoModal: console.log,
    openTargetModal: console.log,
    openScryModal: console.log,
  },
};

export class TestStore {
  store: MobXRootStore;
  constructor(
    playerState: TestInitialState = {},
    opponentState: TestInitialState = {},
    debug = true,
  ) {
    const game = createMockGame(playerState, opponentState);
    this.store = new MobXRootStore(game, debug ? debugDeps : noOpDeps, false);

    this.store.configurationStore.autoAcceptOptionals = false;
    this.store.configurationStore.autoTarget = false;
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

  fromZone(zone: Zones, card: LorcanitoCard, playerId = "player_one") {
    return this.getByZoneAndId(zone, card.id, playerId);
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

  getPlayerLore(playerId = "player_one") {
    const tableStore = this.store.tableStore;
    return tableStore.getTable(playerId).lore;
  }

  resolveTopOfStack(
    params: ResolvingParam & { targetId?: string } = {},
    skipAssertion = false,
  ) {
    if (params.targetId) {
      const target = this.store.cardStore.getCard(params.targetId);
      if (target) {
        params.targets = [target];
      }
    }

    this.store.stackLayerStore.resolveTopOfStack(params);
    if (!skipAssertion) {
      expect(this.stackLayers).toHaveLength(0);
    }
  }

  resolveOptionalAbility(skipAssertion = false) {
    if (!skipAssertion) {
      expect(this.stackLayers).toHaveLength(1);
    }
    this.resolveTopOfStack({}, true);
    // if (!skipAssertion) {
    //   expect(this.stackLayers).toHaveLength(1);
    // }
  }

  skipOptionalAbility(skipAssertion = false) {
    if (!skipAssertion) {
      expect(this.stackLayers).toHaveLength(1);
    }
    this.resolveTopOfStack({ skip: true });
    if (!skipAssertion) {
      expect(this.stackLayers).toHaveLength(0);
    }
  }

  passTurn(force = false) {
    this.store.passTurn(this.store.turnPlayer, force);
  }

  get stackLayers() {
    return this.store.stackLayerStore.layers || [];
  }

  static get aCard(): LorcanitoCard {
    return dingleHopper;
  }

  static get aSongCard(): LorcanitoCard {
    return friendsOnTheOtherSide;
  }
}
