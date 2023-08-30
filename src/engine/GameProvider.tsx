"use client";

import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
} from "react";
import { type Game } from "~/libs/game";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import { ref } from "firebase/database";
import { type Zones } from "~/providers/TabletopProvider";
import { api } from "~/utils/api";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { useGame } from "~/engine/rule-engine/lib/GameControllerProvider";
import { useSelector } from "react-redux";
import { selectTurnPlayer } from "~/engine/rule-engine/lorcana/selectors";

const Context = createContext<{ game: Game; playerId: string }>({
  // @ts-expect-error game is null on initial render
  game: null,
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

export const useLegacyGame = () => {
  const ctx = useContext(Context);
  return [ctx.game, ctx.playerId] as const;
};

// TODO: move to gameprovider
export function useTables() {
  const [game] = useGame();
  return { tables: game.tables };
}

// TODO: Move to gameprovider.tsx
export function usePlayerTable(playerId = "") {
  const { tables } = useTables();
  return { table: tables[playerId] };
}
export const usePlayers = () => {
  const [game, activePlayer] = useGame();
  const tables = game.tables;
  const turnPlayer = game.turnPlayer;
  const players = Object.keys(tables || {});
  const opponent = players.find((p) => p !== activePlayer) || "";

  return {
    opponent: { id: opponent, isOnTurn: turnPlayer === opponent },
    player: { id: activePlayer, isOnTurn: turnPlayer === activePlayer },
  } as const;
};

// TODO: Write a function to handle this
// https://firebase.google.com/docs/database/extend-with-functions?gen=2nd
export function useTurn() {
  const [game, activePlayer] = useGame();
  const tables = game?.tables;
  const turnPlayer = useSelector(selectTurnPlayer);
  const passTurnMutation = api.game.passTurn.useMutation();
  const startGameMutation = api.game.startGame.useMutation();
  const readyToStartMutation = api.game.readyToStart.useMutation();
  const restartGameMutation = api.game.restartGame.useMutation();

  const inkwell: string[] = game.tables?.[turnPlayer]?.zones?.inkwell || [];
  const hasAddedCardToInkWellThisTurn = inkwell.find((card: string) => {
    return game.cards[card]?.meta?.playedThisTurn;
  });

  const players = Object.keys(tables || {});
  const opponent = players.find((p) => p !== activePlayer) || "";

  // TODO: This can mess up, if player clicks more than once
  const passTurn = () => {
    passTurnMutation.mutate({ gameId: game.id, forcePass: true });
    logAnalyticsEvent("pass_turn", { gameId: game.id, turnPlayer });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const startGame = (playerGoingFirst: string) => {
    startGameMutation.mutate({ gameId: game.id, playerGoingFirst });
    logAnalyticsEvent("start_game");
  };

  const readyToStart = (isSolo?: boolean) => {
    readyToStartMutation.mutate({ gameId: game.id, solo: isSolo });
    logAnalyticsEvent("ready_to_start", { gameId: game.id, solo: isSolo });
  };

  const restartGame = () => {
    restartGameMutation.mutate({ gameId: game.id });
    logAnalyticsEvent("restart_game", { gameId: game.id });
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
