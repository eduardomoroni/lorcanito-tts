// TODO: MOVE TO ENGINE
import { createId } from "@paralleldrive/cuid2";
import type { Zones } from "@lorcanito/engine/types";
import type { InternalLogEntry, LogEntry } from "@lorcanito/engine/types/Log";

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
  newLogKey?: string | null,
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
    {},
  );

  return reduce as unknown as InternalLogEntry;
}
