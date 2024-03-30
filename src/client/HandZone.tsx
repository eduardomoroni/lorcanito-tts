import clsx from "clsx";
import React, { type FC, type MouseEvent, useEffect } from "react";
import { useDropCardInZone } from "~/client/hooks/dndCard";
import { ZoneOverlay } from "~/client/components/ZoneOverlay";
import { LorcanitoCardImage } from "~/client/components/card/LorcanitoCardImage";
import { DragNDropOverlay } from "~/client/components/DragNDropOverlay";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";
import { useHotkeysContext } from "react-hotkeys-hook";
import { useCardContextMenu } from "~/client/providers/card-context-menu/useCardContextMenu";
import { observer } from "mobx-react-lite";
import type { CardModel } from "@lorcanito/engine";
import { useGameController } from "~/client/hooks/useGameController";

const HandComponent: FC<{
  cards: CardModel[];
  playerId: string;
  position: "top" | "bottom";
}> = ({ cards, playerId, position }) => {
  const setCardPreview = useSetCardPreview();
  const { openContextMenu } = useCardContextMenu("hand");
  const { dropZoneRef, isActive, isOver } = useDropCardInZone(playerId, "hand");
  const controller = useGameController();
  const isMyTurn = controller.isMyTurn;
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
      data-testid={`hand-zone-${playerId}`}
      ref={dropZoneRef}
      className={clsx(
        isActive ? "scale-150" : "",
        `relative z-30 flex h-full w-full flex-row overflow-y-visible transition duration-100 ease-in-out`,
      )}
    >
      <ZoneOverlay>Hand</ZoneOverlay>
      <DragNDropOverlay isOver={isOver} isActive={isActive}>
        Add to hand
      </DragNDropOverlay>

      {cards
        .slice(0)
        .reverse()
        .map((card, index) => (
          <LorcanitoCardImage
            draggable
            key={card.instanceId}
            index={index}
            card={card}
            zone="hand"
            className={clsx(
              "ml-px",
              position === "bottom" ? "hover:scale-125" : "",
            )}
            isFaceDown={position === "top"}
            onClick={(event: MouseEvent<HTMLDivElement>) => {
              if (controller.manualMode) {
                event.preventDefault();
              }

              openContextMenu(card, event, "top");
            }}
            onMouseEnter={() => {
              setCardPreview({
                card: card.lorcanitoCard,
              });
            }}
            onMouseLeave={() => {
              setCardPreview(undefined);
            }}
          />
        ))}
    </div>
  );
};

export const HandZone = observer(HandComponent);
