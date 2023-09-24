import React, { type FC } from "react";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { observer } from "mobx-react-lite";
import type { CardModel } from "~/store/models/CardModel";
import { DeckCard } from "~/spaces/table/deck/DeckCard";

export const DeckZoneComponent: FC<{ cards: CardModel[]; ownerId: string }> = ({
  cards,
  ownerId,
}) => {
  const store = useGameStore();
  const topCard = store.topDeckCard(ownerId);

  return (
    <div className="relative flex h-fit w-full">
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
