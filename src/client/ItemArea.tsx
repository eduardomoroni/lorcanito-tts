import { useDropCardInZone } from "~/client/hooks/dndCard";
import { ZoneOverlay } from "~/client/components/ZoneOverlay";
import { DragNDropOverlay } from "~/client/components/DragNDropOverlay";
import { LorcanitoCardImage } from "~/client/components/card/LorcanitoCardImage";
import React, { FC } from "react";
import { useUser } from "reactfire";
import { observer } from "mobx-react-lite";
import type { CardModel } from "@lorcanito/engine";
import { useGameController } from "~/client/hooks/useGameController";

const PlayAreaItemComponent: FC<{
  cards: CardModel[];
  hotkeyOffset: number;
  playerId: string;
  position: "top" | "bottom";
}> = ({ cards, playerId, hotkeyOffset, position }) => {
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(playerId, "play");
  const { data: user } = useUser();
  const gameController = useGameController();

  return (
    <div
      ref={dropZoneRef}
      className={`relative flex h-full w-full flex-col overflow-y-hidden rounded-lg`}
    >
      <ZoneOverlay>Item Area</ZoneOverlay>
      <DragNDropOverlay isActive={isActive} isOver={isOver}>
        Play Card
      </DragNDropOverlay>
      <div
        className={`${
          position === "top" ? "top-0" : "bottom-0"
        } absolute right-2 z-10 flex select-none items-center justify-center rounded-lg bg-black px-2 text-lg text-white opacity-50`}
      >
        <span>{`Items count: ${cards.length}`}</span>
      </div>
      <div className="grid grid-cols-1 gap-y-2 overflow-auto">
        {cards.toReversed().map((cardModel: CardModel, index: number) => {
          return (
            <LorcanitoCardImage
              draggable
              onClick={() => {
                if (user?.uid !== cardModel.ownerId) {
                  return;
                }
                gameController.activate(cardModel);
              }}
              zone="play"
              image="image"
              grow="vertical"
              index={hotkeyOffset + index}
              key={cardModel.instanceId}
              card={cardModel}
              enablePopOver={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export const ItemArea = observer(PlayAreaItemComponent);
