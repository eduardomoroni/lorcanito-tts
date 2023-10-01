import { useDropCardInZone } from "~/spaces/hooks/dndCard";
import React, { FC } from "react";
import CardStack from "~/spaces/components/card-stack/cardStack";
import { DragNDropOverlay } from "~/spaces/components/DragNDropOverlay";
import { CardCounter } from "~/spaces/table/CardCounter";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { observer } from "mobx-react-lite";
import type { CardModel } from "~/engine/store/models/CardModel";
import { useTargetModal } from "~/spaces/providers/TargetModalProvider";

const DiscardPileZoneComponent: FC<{
  cards: CardModel[];
  playerId: string;
}> = ({ cards, playerId }) => {
  const store = useGameStore();
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(
    playerId,
    "discard",
  );
  const { openTargetModal } = useTargetModal();

  return (
    <div
      ref={dropZoneRef}
      draggable={false}
      className="group relative mb-2 ml-2 flex aspect-card w-full rounded grayscale"
    >
      <CardCounter length={cards.length} />
      <DragNDropOverlay isActive={isActive} isOver={isOver}>
        Discard card
      </DragNDropOverlay>
      <CardStack
        cards={cards}
        ownerId={playerId}
        onClick={() => {
          openTargetModal({
            title: `Looking at the discard pile`,
            subtitle: `You can take a card from the discard pile, by clicking on it.`,
            filters: [
              { filter: "zone", value: "discard" },
              { filter: "owner", value: playerId },
            ],
            callback: (card) => {
              if (card) {
                store.tableStore.moveCard(card.instanceId, "discard", "hand");
              }
            },
            type: "resolution",
          });
        }}
      />
    </div>
  );
};

export const DiscardPileZone = observer(DiscardPileZoneComponent);
