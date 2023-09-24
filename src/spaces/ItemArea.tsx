import { useDropCardInZone } from "~/hooks/dndCard";
import { ZoneOverlay } from "~/components/ZoneOverlay";
import { DragNDropOverlay } from "~/components/DragNDropOverlay";
import { CardImage } from "~/components/card/CardImage";
import React, { FC } from "react";
import { useUser } from "reactfire";
import { observer } from "mobx-react-lite";
import type { CardModel } from "~/store/models/CardModel";

const PlayAreaItemComponent: FC<{
  cards: CardModel[];
  hotkeyOffset: number;
  playerId: string;
  position: "top" | "bottom";
}> = ({ cards, playerId, hotkeyOffset, position }) => {
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(playerId, "play");
  const { data: user } = useUser();

  return (
    <div
      ref={dropZoneRef}
      className={`relative m-1 flex h-full w-full flex-col overflow-y-hidden rounded-lg p-2`}
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
            <CardImage
              onClick={() => {
                if (user?.uid !== cardModel.ownerId) {
                  return;
                }

                if (cardModel.hasActivatedAbility) {
                  cardModel.activate();
                  return;
                }
              }}
              zone="play"
              image="image"
              grow="vertical"
              index={hotkeyOffset + index}
              key={cardModel.instanceId}
              card={cardModel}
            />
          );
        })}
      </div>
    </div>
  );
};

export const ItemArea = observer(PlayAreaItemComponent);
