"use client";

import { createContext, useContext } from "react";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { Game } from "~/libs/game";

type ContextType = {
  playerHasJoined: boolean;
  playerHasLoadedDeck: boolean;
  playerIsReadyToStart: boolean;
  allPlayersHaveJoined: boolean;
  allPlayersHaveLoadedDeck: boolean;
  allPlayersAreReadyToStart: boolean;
  hasChoosenStartingPlayer: boolean;
};

const initialState: ContextType = {
  playerHasJoined: false,
  playerHasLoadedDeck: false,
  playerIsReadyToStart: false,
  allPlayersHaveJoined: false,
  allPlayersHaveLoadedDeck: false,
  allPlayersAreReadyToStart: false,
  hasChoosenStartingPlayer: false,
};

const PreGameContext = createContext(initialState);

// TODO: get rid of this
export function PreGameProvider({ children }: { children: JSX.Element }) {
  const store = useGameStore();
  const game = store.toJSON();
  const userId = store.activePlayer;

  const isSolo = game.mode === "solo";
  const tables: Game["tables"] = game.tables;
  const playerTable = tables?.[userId];
  const allPlayersHaveJoined = isSolo || Object.values(tables || {}).length > 1;

  const allPlayersHaveLoadedDeck =
    isSolo ||
    (allPlayersHaveJoined &&
      Object.values(tables || {}).every((table) => table?.zones?.deck?.length));
  const allPlayersAreReadyToStart =
    isSolo ||
    (allPlayersHaveJoined &&
      Object.values(tables || {}).every((table) => table.readyToStart));

  return (
    <PreGameContext.Provider
      value={{
        playerHasJoined: Object.keys(tables || {}).includes(userId),
        playerHasLoadedDeck: !!playerTable?.zones?.deck?.length,
        playerIsReadyToStart: playerTable?.readyToStart || false,
        allPlayersHaveJoined,
        allPlayersHaveLoadedDeck,
        allPlayersAreReadyToStart,
        hasChoosenStartingPlayer: !!game.turnPlayer || false,
      }}
    >
      {children}
    </PreGameContext.Provider>
  );
}

export function usePreGame() {
  return useContext(PreGameContext);
}
