"use client";

import React, { createContext, type FC, type ReactNode } from "react";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import { ref } from "firebase/database";
import type { Game, Zones } from "@lorcanito/engine";

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
    },
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
    },
  );
  return status === "success" ? data : uid;
};
