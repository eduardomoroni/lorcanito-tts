import { useDropCardInZone } from "~/hooks/dndCard";
import { ZoneOverlay } from "~/components/ZoneOverlay";
import { DragNDropOverlay } from "~/components/DragNDropOverlay";
import { CardImage } from "~/components/card/CardImage";
import React, { FC } from "react";
import type { CardModel } from "~/store/models/CardModel";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { observer } from "mobx-react-lite";

const InkWellComponent: FC<{
  cards: CardModel[];
  playerId: string;
  position: "bottom" | "top";
}> = ({ cards, playerId, position }) => {
  const store = useGameStore();
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(
    playerId,
    "inkwell"
  );

  const tappedInk = cards.filter((card) => !card.ready);

  return (
    <div
      ref={dropZoneRef}
      className="relative z-20 m-1 mt-2 flex h-full w-full overflow-auto p-1"
    >
      <ZoneOverlay>Ink Well</ZoneOverlay>
      <DragNDropOverlay isOver={isOver} isActive={isActive}>
        Add to Inkwell
      </DragNDropOverlay>
      <div
        className={`${
          position === "top" ? "top-0" : "bottom-0"
        } absolute right-0 z-10 flex select-none items-center justify-center rounded-lg bg-black px-2 text-lg text-white opacity-25`}
      >
        <span>{`Ink available: ${tappedInk.length}/${cards.length}`}</span>
      </div>
      {cards.map((card: CardModel, index: number) => {
        return (
          <CardImage
            key={`${index}-${card}`}
            className={`${card.meta.playedThisTurn ? "grayscale" : ""}`}
            card={card}
            zone="inkwell"
            onClick={() => {
              if (store.activePlayer !== card.ownerId) {
                return;
              }

              store.cardStore.tapCard(card.instanceId, {
                toggle: true,
                inkwell: true,
              });
            }}
            isFaceDown
          />
        );
      })}
    </div>
  );
};

export const InkWell = observer(InkWellComponent);
