"use client";

import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import { useGameLogger } from "~/spaces/Log/game-log/GameLogProvider";
import type { TableCard, Zones } from "~/providers/TabletopProvider";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import type { TargetFilter } from "~/components/modals/target/filters";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import type { Game } from "~/libs/game";
import { useNotification } from "~/providers/NotificationProvider";
import {
  selectGame,
  selectPendingEffects,
  selectPlayerLore,
} from "~/engine/rule-engine/lorcana/selectors";
import { AdditionalArgs, createRuleEngine } from "~/engine/rule-engine/engine";
import { replaceGame } from "~/engine/redux/reducer/gameReducer";
import { LorcanitoGameState } from "~/engine/rule-engine/lorcana/types";
import { ref } from "firebase/database";
import { createFirebaseSyncMiddleware } from "~/engine/redux/middleware/firebaseSyncMiddleware";
import { createSpectatorMiddleware } from "~/engine/redux/middleware/spectatorMiddleware";
import { useYesOrNoModal } from "~/providers/YesOrNoModalProvider";
import { LorcanitoCard } from "~/engine/cardTypes";

type ContextType = {
  engine: ReturnType<typeof createRuleEngine>;
  playerId: string;
  game: LorcanitoGameState;
};
const Context = createContext<ContextType>({
  playerId: "",
  engine: {} as ReturnType<typeof createRuleEngine>,
  game: {} as LorcanitoGameState,
});

export const GameControllerProvider: FC<{
  gameId: string;
  playerId: string;
  ssrGame: Game;
  children: ReactNode;
}> = ({ gameId, playerId, children, ssrGame }) => {
  const database = useDatabase();

  const logger = useGameLogger();
  const notifier = useNotification();
  const openModal = useYesOrNoModal();

  const middleware = [
    createFirebaseSyncMiddleware(database, gameId),
    createSpectatorMiddleware(playerId),
  ];
  const args: AdditionalArgs = {
    logger,
    notifier: notifier,
    modals: { openYesOrNoModal: openModal },
    playerId,
  };

  const { data } = useDatabaseObjectData<Game>(
    ref(database, `games/${ssrGame.id}`),
    {
      initialData: ssrGame,
    }
  );

  const [engine] = useState(
    createRuleEngine(data || ssrGame, middleware, args)
  );

  useEffect(() => {
    if (data) {
      if (data.lastActionId < engine.getState().lastActionId) {
        logAnalyticsEvent("mismatching_action_id");
      }

      engine.store.dispatch(replaceGame({ game: data }));
    }
  }, [data]);

  return (
    <ReduxProvider store={engine.store}>
      <Context.Provider value={{ playerId, game: engine.getState(), engine }}>
        {children}
      </Context.Provider>
    </ReduxProvider>
  );
};

// TODO: WE SHOULD NOT BE USING THIS HOOK
// IS LOADS THE WHOLE GAME STATE
// THIS IS SLOW AND SHOULD BE REPLACED BY A SELECTOR
export function useGame() {
  const { playerId } = useContext(Context);
  const state = useSelector(selectGame);

  return [state, playerId] as const;
}

// TODO: THIS IS PURE TECH DEBT
// WE SHOULD REMOVE THIS ABSTRACTION LAYER AND USE THE ENGINE DIRECTLY
export function useGameController() {
  const { engine, playerId } = useContext(Context);

  function getAllTableCards(): TableCard[] {
    return engine.get.allTableCards();
  }

  function getPlayers(): string[] {
    return engine.get.players();
  }

  // This is the player that is playing the game
  function getActivePlayer() {
    return playerId;
  }

  function getCardsByFilter(filters: TargetFilter[]) {
    console.log(engine);
    return engine.get.byFilter(filters);
  }

  function topDeckCard() {
    return engine.get.topDeckCard(playerId);
  }

  function bottomDeckCard() {
    return engine.get.bottomDeckCard(playerId);
  }

  function getZoneCards(playerId: string, zone: Zones): string[] {
    return engine.get.zoneCards(zone, playerId);
  }

  function getTurnPlayer() {
    return engine.get.turnPlayer();
  }

  function tableCard(instanceId: string) {
    return engine.get.tableCard(instanceId);
  }

  function findTableCard(instanceId: string) {
    return engine.get.tableCard(instanceId);
  }

  const findCardOwner = (instanceId?: string) => {
    if (!instanceId) return;
    return engine.get.cardOwner(instanceId);
  };

  const findShiftCost = (instanceId: string): number => {
    return engine.get.shiftCost(instanceId);
  };

  function findLorcanitoCard(instanceId?: string): undefined | LorcanitoCard {
    return engine.get.lorcanitoCard(instanceId);
  }

  function getStackCards() {
    const turnPlayer = engine.getState().turnPlayer;
    const game = engine.getState();

    return (game.tables?.[turnPlayer]?.zones?.play || []).filter(
      (card: string) => findLorcanitoCard(card)?.type === "action"
    );
  }

  function getPendingEffects() {
    return engine.get.bySelector(selectPendingEffects);
  }

  function resolveEffect(params: { effectId: string; targetId?: string }) {
    const { effectId, targetId } = params;
    const effect = engine.get.effect(effectId);
    engine.moves.resolveEffect(effectId);
  }

  function shuffleCardIntoDeck(params: { instanceId: string; from: Zones }) {
    engine.moves.shuffleCardIntoDeck(params);
  }

  function shuffle() {
    engine.moves.shuffleDeck(playerId);
  }

  function moveCard(params: {
    instanceId: string;
    from: Zones;
    to: Zones;
    position?: "first" | "last";
  }) {
    const { instanceId, from, to, position } = params;
    engine.moves.moveCard(instanceId, from, to, position);
  }

  async function drawCard(player: string) {
    engine.moves.drawCard(player);
  }

  function tapCard(params: {
    exerted?: boolean;
    toggle?: boolean;
    instanceId: string;
    cardId?: string;
    inkwell?: boolean;
  }) {
    const { instanceId, ...rest } = params;
    engine.moves.tapCard(instanceId, { ...rest });
  }

  const setLore = async (
    updaterFunction: (lore: number) => number,
    loreOwner?: string
  ) => {
    const player = loreOwner || playerId || "not_found";
    const playerLore = selectPlayerLore(engine.getState(), loreOwner);

    const updatedLoreValue =
      typeof updaterFunction === "function"
        ? updaterFunction(playerLore)
        : updaterFunction;

    engine.moves.setPlayerLore(player, updatedLoreValue);
  };

  function updateCardDamageCounter(
    instanceId: string,
    amount: number,
    type: "add" | "remove" = "add"
  ) {
    const card = engine.getState().cards[instanceId];
    const cardDamageCounter = card?.meta?.damage || 0;
    const damage =
      type === "add" ? cardDamageCounter + amount : cardDamageCounter - amount;

    engine.moves.updateCardDamage(instanceId, amount, type);
  }

  function quest(instanceId: string) {
    engine.moves.quest(instanceId);
  }

  function playCardFromHand(
    instanceId: string,
    params?: { bodyguard?: boolean }
  ) {
    engine.moves.playCardFromHand(instanceId, params);
  }

  const addToInkwell = (instanceId: string, from: Zones) => {
    engine.moves.addToInkwell(instanceId);
  };

  const challenge = async (attackerId: string, defenderId: string) => {
    engine.moves.challenge(attackerId, defenderId);
  };

  const mulligan = (player: string, cards: string[]) => {
    engine.moves.alterHand(cards, player);
  };

  const shift = (shifter: string, shifted: string) => {
    engine.moves.shift(shifter, shifted);
  };

  function sing(songId: string, singerId: string) {
    engine.moves.singCard(songId, singerId);
  }

  function revealCard(instanceId: string, from: Zones) {
    engine.moves.revealCard(instanceId, from);
  }

  function scry(top: string[], bottom: string[]) {
    engine.moves.scry(top, bottom);
  }

  function passTurn() {
    engine.moves.passTurn(playerId);
  }

  return {
    findLorcanitoCard,
    getCardsByFilter,
    findCardOwner,
    findTableCard,
    bottomDeckCard,
    topDeckCard,
    scry,
    getTurnPlayer,
    resolveEffect,
    getZoneCards,
    getAllTableCards,
    findShiftCost,
    playerId,
    getPlayers,
    tableCard,
    getActivePlayer,
    getStackCards,
    revealCard,
    passTurn,
    updateCardDamageCounter,
    sing,
    mulligan,
    tapCard,
    shift,
    challenge,
    moveCard,
    quest,
    setLore,
    shuffle,
    drawCard,
    getPendingEffects,
    shuffleCardIntoDeck,
    addToInkwell,
    playCardFromHand,
  };
}

// There's another type called Engine
export type GameEngine = ReturnType<typeof useGameController>;
