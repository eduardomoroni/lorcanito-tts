import React, { MouseEvent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";

import { CardModel } from "@lorcanito/engine";
import { useHotkeysContext } from "react-hotkeys-hook";
import { useUser } from "reactfire";
import { useDragCard, useDropCardInZone } from "~/client/hooks/dndCard";
import { useDeckZoneContextMenu } from "~/client/providers/card-context-menu/useCardContextMenu";
import { CardImage } from "~/client/components/image/CardImage";
import { FaceDownCard } from "~/client/components/image/FaceDownCard";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import { CardHotKeyOverlay } from "~/client/components/card/CardHotKeyOverlay";
import { useGameController } from "~/client/hooks/useGameController";

function TopDeckCardComponent({
  card,
  ownerId,
}: {
  card: CardModel;
  ownerId: string;
  count: number;
}) {
  const controller = useGameController();
  const playerId = controller.activePlayer;
  const topCard = controller.topCard;
  const isMyTurn = controller.isMyTurn;
  const turnPlayer = controller.turnPlayer;
  const { enableScope, disableScope } = useHotkeysContext();
  const showHotKey =
    isMyTurn && ownerId === turnPlayer && controller.manualMode;
  const hotkeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMyTurn) {
      enableScope("deck");
    } else {
      disableScope("deck");
    }
  }, [showHotKey]);

  const { data: user } = useUser();

  const topDropZone = useDropCardInZone(playerId, "deck", "last");
  const bottomDropZone = useDropCardInZone(playerId, "deck", "first");
  const isActive = topDropZone.isActive || bottomDropZone.isActive;
  const isOpponentsCard = playerId !== user?.uid;

  const { dragRef } = useDragCard("deck", topCard);

  const setContextMenuPosition = useDeckZoneContextMenu();
  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (!controller.manualMode) {
      return;
    }
    event.preventDefault();
    const position = { x: event.clientX, y: event.clientY };
    setContextMenuPosition(position, "top");
  };
  const openContextMenu = () => {
    const boundingClientRect = hotkeyRef.current?.getBoundingClientRect();
    const position = {
      x: boundingClientRect?.x || 0,
      y: boundingClientRect?.y || 0,
    };
    setContextMenuPosition(position, "top");
  };

  const lorcanitoCard = card.lorcanitoCard;
  const element = card?.meta?.revealed ? (
    <CardImage cardSet={lorcanitoCard.set} cardNumber={lorcanitoCard.number} />
  ) : (
    <FaceDownCard />
  );

  return (
    <div
      onContextMenu={onContextMenu}
      ref={dragRef}
      className={clsx(
        "group relative flex aspect-card h-fit w-full items-center justify-center hover:border-indigo-500",
        `${showHotKey ? "rounded border-2 border-solid border-amber" : ""}`,
        `${isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer"}`,
      )}
      onClick={() => {
        if (isOpponentsCard || !controller.manualMode) {
          return;
        }

        controller.manualMoves.draw(playerId);
        logAnalyticsEvent("draw_card");
      }}
    >
      <div
        ref={topDropZone.dropZoneRef}
        className={clsx(
          "absolute inset-0 z-10 h-1/2 w-full border-2 border-dashed border-gray-500 bg-white",
          isActive ? "opacity-25" : "opacity-0",
          topDropZone.isOver ? "opacity-50" : "",
        )}
      >
        Top of the deck
      </div>
      <div
        ref={bottomDropZone.dropZoneRef}
        className={clsx(
          "absolute bottom-0 right-0 z-10 h-1/2 w-full border-2 border-dashed border-gray-500 bg-white",
          bottomDropZone.isOver ? " opacity-50" : "",
          isActive ? "opacity-25" : "opacity-0",
        )}
      >
        Bottom of the deck
      </div>
      {showHotKey && (
        <CardHotKeyOverlay
          card={card}
          zone={"deck"}
          index={0}
          callback={openContextMenu}
          ref={hotkeyRef}
        />
      )}
      {element}
    </div>
  );
}

export const TopDeckCard = observer(TopDeckCardComponent);
