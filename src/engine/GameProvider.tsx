"use client";

import React, { createContext, type FC, type ReactNode } from "react";
import { type Game } from "~/libs/game";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import { ref } from "firebase/database";
import { type Zones } from "~/providers/TabletopProvider";
import { api } from "~/utils/api";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useGameStore } from "~/engine/lib/GameStoreProvider";

const Context = createContext<{ game: Game; playerId: string }>({
  game: null!,
  playerId: "",
});

export const GameProvider: FC<{
  ssrGame: Game;
  playerId: string;
  children: ReactNode;
}> = ({ ssrGame, playerId, children }) => {
  const database = useDatabase();
  const { data } = useDatabaseObjectData<Game>(
    ref(database, `games/${ssrGame.id}`),
    {
      initialData: ssrGame,
    }
  );

  if (data === null) {
    return (
      <Context.Provider value={{ game: ssrGame, playerId }}>
        {children}
      </Context.Provider>
    );
  }

  Object.values(data.tables || {}).forEach((table) => {
    const allZones: Zones[] = ["play", "hand", "inkwell", "deck", "discard"];

    allZones.forEach((zone) => {
      if (table.zones && !table.zones[zone]) {
        table.zones[zone] = [];
      }
    });
  });

  return (
    <Context.Provider value={{ game: data, playerId }}>
      {children}
    </Context.Provider>
  );
};

export const usePlayerNickname = (uid: string) => {
  const database = useDatabase();

  const { data, status } = useDatabaseObjectData<string>(
    ref(database, `users/${uid}`),
    {
      initialData: uid,
    }
  );
  return status === "success" ? data : uid;
};

// TODO: GET RID OF THI
export function useTurn() {
  const store = useGameStore();
  const activePlayer = store.activePlayer;
  const tables = store.tableStore.tables;
  const turnPlayer = store.turnPlayer;
  const passTurnMutation = api.game.passTurn.useMutation();
  const startGameMutation = api.game.startGame.useMutation();
  const readyToStartMutation = api.game.readyToStart.useMutation();
  const restartGameMutation = api.game.restartGame.useMutation();

  const inkwell = tables?.[turnPlayer]?.zones?.inkwell.cards || [];
  const hasAddedCardToInkWellThisTurn = inkwell.find((card) => {
    return card.meta.playedThisTurn;
  });

  const players = Object.keys(tables || {});
  const opponent = players.find((p) => p !== activePlayer) || "";

  // TODO: This can mess up, if player clicks more than once
  const passTurn = () => {
    passTurnMutation.mutate({ gameId: store.id, forcePass: true });
    logAnalyticsEvent("pass_turn", { gameId: store.id, turnPlayer });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const startGame = (playerGoingFirst: string) => {
    startGameMutation.mutate({ gameId: store.id, playerGoingFirst });
    logAnalyticsEvent("start_game");
  };

  const readyToStart = (isSolo?: boolean) => {
    readyToStartMutation.mutate({ gameId: store.id, solo: isSolo });
    logAnalyticsEvent("ready_to_start", { gameId: store.id, solo: isSolo });
  };

  const restartGame = () => {
    restartGameMutation.mutate({ gameId: store.id });
    logAnalyticsEvent("restart_game", { gameId: store.id });
    // TODO: refresh both browsers
  };

  const isSpectator = !players.includes(activePlayer);

  return {
    tables,
    passTurn,
    isPassingTurn: passTurnMutation.isLoading,
    startGame,
    isStartingGame: startGameMutation.isLoading,
    readyToStart,
    isReadyToStartLoading: readyToStartMutation.isLoading,
    restartGame,
    turnPlayer,
    activePlayer,
    opponent,
    players,
    isSpectator,
    hasAddedCardToInkWellThisTurn,
    // The beginning of the game is no one's turn
    isMyTurn: turnPlayer === activePlayer,
    isOpponentTurn: turnPlayer === opponent,
  };
}
