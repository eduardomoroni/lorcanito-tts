import type { Game } from "~/libs/game";
import type { Zones } from "~/providers/TabletopProvider";
import {
  selectBottomDeckCard,
  selectCardMeta,
  selectCardOwner,
  selectPlayerZone,
  selectShiftCost,
  selectTableCard,
  selectTopDeckCard,
} from "~/engine/rule-engine/lorcana/selectors";
import { allCardsById } from "~/engine/cards/cards";
import { LorcanitoCard } from "~/engine/cardTypes";
import { MobXRootStore } from "~/store/RootStore";

import { type Database } from "firebase/database";
import type { Dependencies } from "~/store/types";

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
  database?: Database
) {
  const {
    notifier: { sendNotification },
  } = args;
  const mobxStore = new MobXRootStore(initialState, args);

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
      }) => {
        const { zone, lorcanitoId, owner } = params;
        const cardsInZone = engine.get.zoneCards(zone, owner);
        // TODO: do something when it's not found
        return cardsInZone.find(
          (instanceId: string) =>
            lorcanitoId === engine.get.lorcanitoCard(instanceId)?.id
        ) as string;
      },
      bySelector: bySelector,
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
      topDeckCard: (playerId: string) =>
        selectTopDeckCard(engine.getState(), playerId),
      bottomDeckCard: (playerId: string) =>
        selectBottomDeckCard(engine.getState(), playerId),
      cardOwner: (instanceId: string) => {
        return selectCardOwner(engine.getState(), instanceId);
      },
      cardMeta: (instanceId: string) => {
        return selectCardMeta(engine.getState(), instanceId);
      },
      shiftCost: (instanceId: string): number => {
        return selectShiftCost(engine.getState(), instanceId);
      },
      tableCard: (instanceId?: string) => {
        return selectTableCard(engine.getState(), instanceId);
      },
      lorcanitoCard: (
        instanceId?: string | null
      ): LorcanitoCard | undefined => {
        const cardId = selectTableCard(engine.getState(), instanceId)?.cardId;
        return cardId ? allCardsById[cardId] : undefined;
      },
      zoneCards(zone: Zones, playerId: string) {
        return selectPlayerZone(engine.getState(), playerId, zone);
      },
      zoneTableCards(zone: Zones, playerId: string) {
        return selectPlayerZone(engine.getState(), playerId, zone).map((card) =>
          engine.get.tableCard(card)
        );
      },
      allTableCards() {
        return Object.values(engine.getState().cards || {});
      },
      players() {
        return Object.keys(engine.getState().tables || {}) || [];
      },
    },
    moves: {
      resolveEffect: (
        effectId: string,
        params?: {
          targetId?: string;
        }
      ) => {
        mobxStore.stackLayerStore.resolveLayer(effectId, params);
      },
      drawCard(player: string) {
        mobxStore.drawCard(player);
      },
      alterHand: (cards: string[], player: string) => {
        mobxStore.alterHand(cards, player);
      },
      shuffleDeck: (player: string) => {
        mobxStore.tableStore.shuffleDeck(player);
      },
      shuffleCardIntoDeck: (params: { instanceId: string; from: Zones }) => {
        mobxStore.cardStore.shuffleCardIntoDeck(params.instanceId, params.from);
      },
      setPlayerLore: (player: string, lore: number) => {
        mobxStore.tableStore.setPlayerLore(player, lore);
      },
      moveCard: (
        instanceId = "",
        from: Zones,
        to: Zones,
        position: "first" | "last" = "last"
      ) => {
        mobxStore.tableStore.moveCard(instanceId, from, to, position);
      },
      passTurn: (player: string) => {
        mobxStore.passTurn(player);
      },
      playCardFromHand: (
        instanceId?: string,
        params?: { bodyguard?: boolean }
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
        }
      ) => {
        if (instanceId) {
          mobxStore.cardStore.tapCard(instanceId, opts);
        }
      },
      revealCard: (instanceId: string = "", from: Zones) => {
        if (instanceId) {
          mobxStore.cardStore.revealCard(instanceId, from);
        }
      },
      updateCardDamage: (
        instanceId = "",
        amount: number,
        type: "add" | "remove" = "add"
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
