"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import CardContextMenu, {
  type ContextMenuItem,
} from "~/spaces/providers/card-context-menu/CardContextMenu";
import { useHotkeysContext } from "react-hotkeys-hook";

type ContextMenuPayload = { x?: number; y?: number };

export const ContextMenu = createContext<{
  setPosition: (position: ContextMenuPayload) => void;
  setItems: (items: ContextMenuItem[]) => void;
  setDirection: (direction: "top" | "bottom") => void;
  position: ContextMenuPayload | null;
}>({
  setPosition: () => {},
  setDirection: () => {},
  setItems: () => {},
  position: {
    x: 0,
    y: 0,
  },
});

export function ContextMenuProvider({ children }: { children: JSX.Element }) {
  const [position, setPosition] = useState<ContextMenuPayload | null>(null);
  const [direction, setDirection] = useState<"top" | "bottom">("bottom");
  const [items, setItems] = useState<ContextMenuItem[]>([]);
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    if (position) {
      enableScope("context_menu");
    } else {
      disableScope("context_menu");
    }
  }, [position]);

  return (
    <ContextMenu.Provider
      value={{ setPosition, position, setItems, setDirection }}
    >
      {position ? (
        <div
          className={`absolute z-50`}
          style={{ left: position.x, top: position.y }}
        >
          <CardContextMenu
            direction={direction}
            show={!!position.y || !!position.x}
            onClose={() => setPosition(null)}
            items={items}
          />
        </div>
      ) : null}

      {children}
    </ContextMenu.Provider>
  );
}

export function useContextMenu(items: Array<ContextMenuItem | undefined>) {
  const context = useContext(ContextMenu);

  const setPosition = (
    position: ContextMenuPayload,
    direction: "bottom" | "top" = "bottom",
  ) => {
    context.setDirection(direction);
    context.setItems(items.filter(Boolean) as ContextMenuItem[]);
    context.setPosition(position);
  };

  return setPosition;
}
