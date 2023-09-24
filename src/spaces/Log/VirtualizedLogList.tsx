import React, { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Log } from "~/spaces/Log/LogEntry";
import { ref } from "firebase/database";
import { useDatabase, useDatabaseListData } from "reactfire";
import type { InternalLogEntry } from "~/spaces/Log/types";
import { useGameStore } from "~/engine/lib/GameStoreProvider";

export function VirtualizedLogList(props: {
  size: { width: number; height: number };
}) {
  const store = useGameStore();
  const game = store.toJSON();
  const database = useDatabase();

  const logsRef = ref(database, `logs/${game.id}/`);
  const { data: logEntries } = useDatabaseListData<InternalLogEntry>(logsRef, {
    idField: "id",
    initialData: [],
  });
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtual = useVirtualizer({
    count: logEntries?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  if (!logEntries) {
    return null;
  }

  const items = virtual.getVirtualItems();

  useEffect(() => {
    if (typeof virtual.scrollToIndex === "function" && logEntries.length) {
      virtual.scrollToIndex(logEntries.length - 1);
    }
  }, [logEntries.length]);

  return (
    <div
      ref={parentRef}
      style={{
        height: props.size.height,
        width: props.size.width,
        overflowY: "auto",
        contain: "strict",
      }}
    >
      <div
        style={{
          height: virtual.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            transform: `translateY(${items[0]?.start}px)`,
          }}
        >
          {items.map((virtualRow) => {
            const entry = logEntries[virtualRow.index];

            if (!entry) {
              return null;
            }

            return (
              <div
                key={entry?.id || virtualRow.key}
                data-index={virtualRow.index}
                ref={virtual.measureElement}
              >
                <Log entry={entry} key={entry?.id || virtualRow.key} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
