import { useDropCardInZone } from "~/client/hooks/dndCard";
import { ZoneOverlay } from "~/client/components/ZoneOverlay";
import { DragNDropOverlay } from "~/client/components/DragNDropOverlay";
import { LorcanitoCardImage } from "~/client/components/card/LorcanitoCardImage";
import React, { FC } from "react";
import type { CardModel } from "@lorcanito/engine";
import { observer } from "mobx-react-lite";
import { useGameController } from "~/client/hooks/useGameController";
import { FaceDownCard } from "~/client/components/image/FaceDownCard";
import { Tooltip } from "antd";

const InkWellComponent: FC<{
  cards: CardModel[];
  playerId: string;
  position: "bottom" | "top";
  canAddToInkwell?: boolean;
}> = ({ cards, playerId, position, canAddToInkwell }) => {
  const controller = useGameController();
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(
    playerId,
    "inkwell",
  );

  const tappedInk = cards.filter((card) => !card.ready);

  return (
    <div
      ref={dropZoneRef}
      data-testid={`inkwell-zone-${playerId}`}
      className="relative z-20 flex h-full w-full overflow-auto p-1"
    >
      <ZoneOverlay>Ink Well</ZoneOverlay>
      <DragNDropOverlay isOver={isOver} isActive={isActive}>
        Add to Inkwell
      </DragNDropOverlay>
      <div
        className={`${
          position === "top" ? "top-0" : "bottom-0"
        } absolute right-0 z-10 flex select-none items-center justify-center rounded-lg bg-black px-2 text-lg text-white opacity-50`}
      >
        <span>{`Ink available: ${cards.length - tappedInk.length}/${
          cards.length
        }`}</span>
      </div>
      {cards.map((card: CardModel, index: number) => {
        return (
          <LorcanitoCardImage
            draggable
            key={`${index}-${card}`}
            card={card}
            zone="inkwell"
            className="saturate-200"
            onClick={() => {
              if (
                controller.manualMode &&
                controller.activePlayer === card.ownerId
              ) {
                controller.manualMoves.tap(card, {
                  toggle: true,
                });
              }
            }}
            isFaceDown
          />
        );
      })}
      {canAddToInkwell &&
      playerId === controller.activePlayer &&
      controller.isMyTurn ? (
        <Tooltip title={"You can still add a card to inkwell this turn"}>
          <div className={"relative flex aspect-card rounded-lg "}>
            <FaceDownCard
              className={
                "flex border-2 border-dotted !border-slate-700 opacity-25 grayscale"
              }
            />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
};

export const InkWell = observer(InkWellComponent);
