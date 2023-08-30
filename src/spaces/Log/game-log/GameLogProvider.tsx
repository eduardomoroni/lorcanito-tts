"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import { useUser } from "reactfire";
import { type Zones } from "~/providers/TabletopProvider";
import { SingletonChat } from "~/providers/stream-chat-provider/StreamChatProvider";
import {
  type InternalLogEntry,
  type LogEntry,
} from "~/spaces/Log/game-log/types";
import { type UserResponse } from "stream-chat";

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

export const privateZones: Zones[] = ["hand", "deck"];
function isPrivateEntry(newEntry: InternalLogEntry) {
  if (newEntry.type === "MOVE_CARD") {
    return (
      privateZones.includes(newEntry.to) && privateZones.includes(newEntry.from)
    );
  }

  if (newEntry.type === "MULLIGAN" || newEntry.type === "NEW_TURN") {
    return true;
  }

  return false;
}

export const createLogEntry = (
  logEntry: LogEntry,
  sender: string | "SYSTEM",
  newLogKey?: string | null
) => {
  // @ts-expect-error TODO: fix this PASS_TURN needs to be fixed
  const player = logEntry.sender || sender;
  const newEntry: InternalLogEntry = {
    ...logEntry,
    sender: player,
    id: newLogKey || createId(),
  };
  const privateLog = isPrivateEntry(newEntry);

  if (privateLog && player && newEntry.instanceId) {
    newEntry.private = {
      [player]: {
        instanceId: newEntry.instanceId,
      },
    };
  }

  return replaceUndefinedByNull(newEntry);
};

export function GameLogProvider({ children }: { children: JSX.Element }) {
  const [isActive, setIsActive] = useState(true);
  const { data: user } = useUser();

  const updateLogEntry = (logEntry: LogEntry) => {
    // @ts-expect-error TODO: fix this
    if (!logEntry.sender) {
      // @ts-expect-error TODO: fix this
      logEntry.sender = user?.uid || "SYSTEM";
    }

    const internalEntry = createLogEntry(logEntry, user?.uid || "SYSTEM");
    pushLogToStreamClient(internalEntry);
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

async function pushLogToStreamClient(
  logEntry: LogEntry,
  streamUser?: UserResponse
) {
  await SingletonChat.sendMessage(
    {
      user: streamUser,
      silent: true,
      logEntry: logEntry,
    },
    { skip_push: true }
  );
}

function replaceUndefinedByNull(obj: InternalLogEntry): InternalLogEntry {
  const reduce = Object.entries(obj).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
      if (value === undefined) {
        acc[key] = null;
      } else {
        acc[key] = value;
      }

      return acc;
    },
    {}
  );

  return reduce as unknown as InternalLogEntry;
}
