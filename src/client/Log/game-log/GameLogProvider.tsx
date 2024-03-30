"use client";

import { createContext, useContext, useState } from "react";
import { useUser } from "reactfire";
import type { InternalLogEntry, LogEntry } from "@lorcanito/engine";

type ContextType = {
  logger: { log: (entry: LogEntry) => void };
  log: InternalLogEntry[];
  isActive: boolean;
  setIsActive: (active: boolean) => void;
};

const GameLogContext = createContext<ContextType>({
  logger: { log: console.log },
  log: [],
  isActive: false,
  setIsActive: () => {},
});

export function GameLogProvider({ children }: { children: JSX.Element }) {
  const [isActive, setIsActive] = useState(true);
  const { data: user } = useUser();

  const updateLogEntry = (logEntry: LogEntry) => {
    // // @ts-expect-error TODO: fix this
    // if (!logEntry.sender) {
    //   // @ts-expect-error TODO: fix this
    //   logEntry.sender = user?.uid || "SYSTEM";
    // }
    //
    // const internalEntry = createLogEntry(logEntry, user?.uid || "SYSTEM");
    // // pushLogToStreamClient(internalEntry);
  };

  const context: ContextType = {
    log: [],
    // log: log || [],
    logger: {
      log: updateLogEntry,
    },
    isActive,
    setIsActive,
  };

  return (
    <GameLogContext.Provider value={context}>
      {children}
    </GameLogContext.Provider>
  );
}

export function useGameLogger() {
  return useContext(GameLogContext).logger;
}

export function useGameLogContext() {
  return useContext(GameLogContext);
}
