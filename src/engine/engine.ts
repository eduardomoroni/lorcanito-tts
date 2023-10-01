import type { Game } from "~/libs/game";
import type { Zones } from "~/spaces/providers/TabletopProvider";
import { allCardsById } from "~/engine/cards/cards";
import { LorcanitoCard } from "~/engine/cards/cardTypes";
import { MobXRootStore } from "~/engine/store/RootStore";

import { type Database } from "firebase/database";
import type { Dependencies } from "~/engine/store/types";

export type AdditionalArgs = Dependencies;

const fallbackArgs: AdditionalArgs = {
  logger: {
    log: () => {},
  },
  notifier: {
    sendNotification: () => {},
    clearAllNotifications: () => {},
    clearNotification: () => {},
  },
  modals: {
    openYesOrNoModal: () => {},
    openTargetModal: () => {},
    openScryModal: () => {},
  },
  playerId: "",
};

// TODO: Get rid of this
export function createRuleEngine(
  initialState: Game,
  middleware = [],
  args: AdditionalArgs = fallbackArgs,
  database?: Database,
) {
  const {
    notifier: { sendNotification },
  } = args;
  const mobxStore = new MobXRootStore(initialState, args);

  console.info("createRuleEngine is discontinued, please use TestStore");

  function bySelector<T>(selector: (state: { game: Game }) => T): T {
    return selector({ game: mobxStore.toJSON() });
  }

  const engine = {
    store: mobxStore,
    sync: (game: Game) => {
      mobxStore.sync(game);
    },
    getState: (): Game => {
      return mobxStore.toJSON();
    },
    get: {
      // Used mostly in tests
      byZoneAndId: (params: {
        zone: Zones;
        lorcanitoId: string;
        owner: string;
      }) => {},
      turnPlayer: () => {
        return engine.getState().turnPlayer;
      },
      activePlayer: () => {
        return engine.getState().turnPlayer;
      },
      effect: (effectId: string) => {
        return engine
          .getState()
          .effects.find((effect) => effect.id === effectId);
      },
      effects: () => {
        return engine.getState().effects || [];
      },
      tableCard: (instanceId?: string) => {},
      lorcanitoCard: (instanceId?: string | null) => {},
      zoneCards(zone: Zones, playerId: string) {},
      zoneTableCards(zone: Zones, playerId: string) {},

      players() {
        return Object.keys(engine.getState().tables || {}) || [];
      },
    },
    moves: {
      resolveEffect: (
        effectId: string,
        params?: {
          targetId?: string;
        },
      ) => {
        mobxStore.stackLayerStore.resolveLayer(effectId, params);
      },
      alterHand: (cards: string[], player: string) => {
        mobxStore.alterHand(cards, player);
      },
      shuffleDeck: (player: string) => {
        mobxStore.tableStore.shuffleDeck(player);
      },

      setPlayerLore: (player: string, lore: number) => {
        mobxStore.tableStore.setPlayerLore(player, lore);
      },
      moveCard: (
        instanceId = "",
        from: Zones,
        to: Zones,
        position: "first" | "last" = "last",
      ) => {
        mobxStore.tableStore.moveCard(instanceId, from, to, position);
      },
      passTurn: (player: string) => {
        mobxStore.passTurn(player);
      },
      playCardFromHand: (
        instanceId?: string,
        params?: { bodyguard?: boolean },
      ) => {
        if (!instanceId) {
          console.log("No instanceId");
          return;
        }
        mobxStore.playCardFromHand(instanceId, params);
      },
      quest: (instanceId: string) => {
        mobxStore.cardStore.quest(instanceId);
      },
      tapCard: (
        instanceId: string = "",
        opts: {
          exerted?: boolean;
          toggle?: boolean;
          cardId?: string;
          inkwell?: boolean;
        },
      ) => {
        if (instanceId) {
          mobxStore.cardStore.tapCard(instanceId, opts);
        }
      },
      updateCardDamage: (
        instanceId = "",
        amount: number,
        type: "add" | "remove" = "add",
      ) => {
        mobxStore.cardStore.updateCardDamage(instanceId, amount, type);
      },
      singCard: (songId?: string, singerId?: string) => {
        mobxStore.sing(songId, singerId);
      },
      challenge: (attackerId?: string, defenderId?: string) => {
        mobxStore.cardStore.challenge(attackerId, defenderId);
      },
      shift: (shifter?: string, shifted?: string) => {
        mobxStore.shiftCard(shifter, shifted);
      },
    },
  };

  return engine;
}

export type Engine = ReturnType<typeof createRuleEngine>;
