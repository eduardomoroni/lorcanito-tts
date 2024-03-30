import React, { memo } from "react";
import type { InternalLogEntry } from "@lorcanito/engine";

import { mapLogEntries } from "~/client/Log/game-log/allEntries";
import { useGameController } from "~/client/hooks/useGameController";
import { useFirebaseUser } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";

type LogEntryProps = {
  entry: InternalLogEntry;
};

export const Log = memo(
  (props: LogEntryProps) => {
    const controller = useGameController();
    const user = useFirebaseUser();
    const { entry } = props;

    const isActivePlayerTheSender = user?.uid === entry.sender;

    try {
      const elements = mapLogEntries(controller, entry, user?.uid);

      if (entry.type === "PASS_TURN") {
        return (
          <div key={entry.id}>
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
          </div>
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
  (prev, next) => prev.entry.id === next.entry.id,
);

Log.displayName = "LogEntry";
