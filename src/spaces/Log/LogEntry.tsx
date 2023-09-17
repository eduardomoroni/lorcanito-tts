import React, { memo } from "react";
import type { InternalLogEntry } from "~/spaces/Log/types";
import { useGameStore } from "~/engine/rule-engine/lib/GameStoreProvider";

import { mapLogEntries } from "~/spaces/Log/game-log/allEntries";

type LogEntryProps = {
  entry: InternalLogEntry;
};

export const Log = memo(
  (props: LogEntryProps) => {
    const store = useGameStore();
    const { entry } = props;

    const isActivePlayerTheSender = store.activePlayer === entry.sender;

    try {
      const elements = mapLogEntries(store, entry);

      if (entry.type === "PASS_TURN") {
        return (
          <>
            <p className="ml-2 break-words text-sm text-slate-400">
              {elements}
            </p>
            <p className="text-md ml-2 break-words font-bold text-white">
              {`End of ${
                isActivePlayerTheSender ? "Your" : "Opponent's"
              } turn.`}
            </p>
            <p className="text-md ml-2 break-words font-bold text-white">
              {`Turn ${entry.turn + 1} begins: `}
            </p>
          </>
        );
      }

      return (
        <p className="ml-2 break-words text-sm text-slate-400">{elements}</p>
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  (prev, next) => prev.entry.id === next.entry.id
);

Log.displayName = "LogEntry";
