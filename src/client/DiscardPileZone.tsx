import { useDropCardInZone } from "~/client/hooks/dndCard";
import React, { FC } from "react";
import CardStack from "~/client/components/card-stack/cardStack";
import { DragNDropOverlay } from "~/client/components/DragNDropOverlay";
import { CardCounter } from "~/client/table/CardCounter";
import { observer } from "mobx-react-lite";
import type { CardModel } from "@lorcanito/engine";
import { useTargetModal } from "~/client/providers/TargetModalProvider";
import { useGameController } from "~/client/hooks/useGameController";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";

const DiscardPileZoneComponent: FC<{
  cards: CardModel[];
  playerId: string;
}> = ({ cards, playerId }) => {
  const controller = useGameController();
  const setPreview = useSetCardPreview();

  const { dropZoneRef, isActive, isOver } = useDropCardInZone(
    playerId,
    "discard",
  );
  const { openTargetModal } = useTargetModal();

  return (
    <div
      ref={dropZoneRef}
      draggable={false}
      className="group relative flex aspect-card w-full grayscale"
      onMouseEnter={() => {
        const card = cards[cards.length - 1];
        setPreview({ card: card?.lorcanitoCard });
      }}
      onMouseLeave={() => {
        setPreview(undefined);
      }}
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
            subtitle: controller.manualMode
              ? `You can take a card from the discard pile, by clicking on it.`
              : "",
            filters: [
              { filter: "zone", value: "discard" },
              { filter: "owner", value: playerId },
            ],
            amount: 99,
            callback: (cards) => {
              if (!controller.manualMode) {
                return;
              }
              cards.forEach((card) => {
                controller.manualMoves.moveCardTo(card, "hand");
              });
            },
          });
        }}
      />
    </div>
  );
};

export const DiscardPileZone = observer(DiscardPileZoneComponent);
