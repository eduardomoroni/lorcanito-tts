import React from "react";

import { Button, Popover } from "antd";
import { observer } from "mobx-react-lite";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { CardModel } from "@lorcanito/engine";
import { createContextMenuItems } from "~/client/providers/card-context-menu/createCardContextMenuItems";
import { useGameController } from "~/client/hooks/useGameController";

const content: React.FC<{ card: CardModel }> = ({ card }) => {
  const store = useGameStore();
  const gameController = useGameController();
  const items = createContextMenuItems(card, store, gameController);

  return (
    <div
      className="flex flex-col"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="mt-1 flex-col">
        {items.map((item, index) => {
          // We don't have sub menus implemented
          if (item.items) {
            return null;
          }

          return (
            <Button
              className={"flex"}
              key={index + item.text}
              onClick={item.onClick}
            >
              {item.text}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export const CardPopOverContent = observer(content);

const CardPopOverComponent: React.FC<{
  card: CardModel;
  children: React.ReactElement;
  owner?: string;
  disabled?: boolean;
}> = ({ card, children, owner, disabled }) => {
  const store = useGameStore();

  if (
    disabled ||
    !store.hasPriority ||
    !["play", "hand"].includes(card.zone) ||
    !card.ready ||
    card.ownerId !== owner
  ) {
    return children;
  }

  return (
    <Popover
      overlayClassName="group transition duration-150 ease-in-out"
      content={<CardPopOverContent card={card} />}
      placement={card.zone === "play" ? "bottom" : "top"}
      title={card.fullName}
      mouseEnterDelay={card.zone === "hand" ? 0.5 : 0.1}
    >
      {children}
    </Popover>
  );
};

export const CardPopOver = observer(CardPopOverComponent);
