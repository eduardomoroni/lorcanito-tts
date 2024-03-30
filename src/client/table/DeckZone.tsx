import React, { type FC } from "react";
import clsx from "clsx";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { observer } from "mobx-react-lite";
import { DeckCard } from "~/client/table/deck/DeckCard";
import type { CardModel } from "@lorcanito/engine";

export const DeckZoneComponent: FC<{ cards: CardModel[]; ownerId: string }> = ({
  cards,
  ownerId,
}) => {
  const store = useGameStore();
  const topCard = store.topDeckCard(ownerId);

  return (
    <div className={clsx("relative flex w-full")}>
      {cards.map((card, index) => {
        return (
          <DeckCard
            key={index}
            count={cards.length}
            index={index}
            card={card}
            ownerId={ownerId}
            isTopCard={topCard?.instanceId === card.instanceId}
          />
        );
      })}
    </div>
  );
};

export const DeckZone = observer(DeckZoneComponent);
