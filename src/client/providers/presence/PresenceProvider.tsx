"use client";

import React, {
  createContext,
  type FC,
  type ReactNode,
  useEffect,
} from "react";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import { ref } from "firebase/database";
import {
  removeLobbyPresence,
  setUpPlayerPresence,
} from "~/libs/3rd-party/firebase/database/presence";

type ContextType = { isPresent: (player: string) => boolean };
const Context = createContext<ContextType>({
  isPresent: () => false,
});

type Presence = {
  lastOnline: number;
  connections: Record<string, boolean>;
};

export const PresenceProvider: FC<{
  gameId: string;
  playerId: string;
  children: ReactNode;
}> = ({ gameId, playerId, children }) => {
  useEffect(() => {
    const unsubscribe = setUpPlayerPresence(playerId);
    return () => {
      unsubscribe();
      removeLobbyPresence(gameId);
    };
  }, [playerId]);

  function isPresent(player: string) {
    return false;
  }

  return <Context.Provider value={{ isPresent }}>{children}</Context.Provider>;
};

export const useIsPresent = (player: string) => {
  const database = useDatabase();

  const { data } = useDatabaseObjectData<Presence["connections"]>(
    ref(database, `presence/players/${player}/connections`),
    {
      initialData: true,
    },
  );
  return !!data;
};
