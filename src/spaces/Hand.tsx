import { useDropCardInZone } from "~/hooks/dndCard";
import { ZoneOverlay } from "~/components/ZoneOverlay";
import { CardImage } from "~/components/card/CardImage";
import React, { type FC, type MouseEvent, useEffect } from "react";
import { DragNDropOverlay } from "~/components/DragNDropOverlay";
import { useCardPreview } from "~/providers/CardPreviewProvider";
import { useHotkeysContext } from "react-hotkeys-hook";
import { useCardContextMenu } from "~/providers/card-context-menu/useCardContextMenu";
import { useTurn } from "~/engine/GameProvider";

export const Hand: FC<{
  cards: string[];
  playerId: string;
  position: "top" | "bottom";
}> = ({ cards, playerId, position }) => {
  const setCardPreview = useCardPreview();
  const { openContextMenu } = useCardContextMenu("hand");
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(playerId, "hand");
  const { isMyTurn } = useTurn();
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    if (isMyTurn) {
      enableScope("hand");
    } else {
      disableScope("hand");
    }
  }, [isMyTurn]);

  return (
    <div
      ref={dropZoneRef}
      className={`${
        isActive ? "scale-150" : ""
      } z-30 flex h-full w-full flex-row overflow-y-visible transition duration-150 ease-in-out`}
    >
      <ZoneOverlay>Hand</ZoneOverlay>
      <DragNDropOverlay isOver={isOver} isActive={isActive}>
        Add to hand
      </DragNDropOverlay>

      {cards
        .slice(0)
        .reverse()
        .map((card, index) => (
          <CardImage
            key={card}
            index={index}
            instanceId={card}
            zone="hand"
            className={`${position === "bottom" ? "hover:scale-125" : ""}`}
            isFaceDown={position === "top"}
            onClick={(event: MouseEvent<HTMLDivElement>) => {
              event.preventDefault();
              openContextMenu(card, event, "top");
            }}
            onMouseEnter={() => {
              setCardPreview({ instanceId: card, tableId: playerId });
            }}
            onMouseLeave={() => {
              setCardPreview(undefined);
            }}
          />
        ))}
    </div>
  );
};