"use client";

import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
} from "react";
import { type GameLobby } from "~/libs/game";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import { ref, set } from "firebase/database";

const Context = createContext<{ lobby: GameLobby; playerId: string }>({
  lobby: null!,
  playerId: "",
});

export const GameLobbyProvider: FC<{
  ssrLobby?: GameLobby;
  gameId: string;
  playerId: string;
  children: ReactNode;
}> = ({ ssrLobby, playerId, children, gameId }) => {
  const database = useDatabase();
  const { data } = useDatabaseObjectData<GameLobby>(
    ref(database, `lobbies/${ssrLobby?.id || gameId}`),
    {
      initialData: ssrLobby,
    },
  );

  return (
    <Context.Provider value={{ lobby: data, playerId }}>
      {children}
    </Context.Provider>
  );
};

export const useLobbyPresence = () => {
  const database = useDatabase();
  const { data } = useDatabaseObjectData<Record<string, string>>(
    ref(database, `presence/lobbies/`),
    {
      initialData: {},
    },
  );

  return data;
};

export const useGameLobby = () => {
  const ctx = useContext(Context);
  return [ctx.lobby, ctx.playerId] as const;
};
