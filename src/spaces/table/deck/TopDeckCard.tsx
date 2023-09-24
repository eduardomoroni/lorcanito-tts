import { CardModel } from "~/store/models/CardModel";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { useHotkeysContext } from "react-hotkeys-hook";
import React, { MouseEvent, useEffect, useRef } from "react";
import { useUser } from "reactfire";
import { useDragCard, useDropCardInZone } from "~/hooks/dndCard";
import { useDeckZoneContextMenu } from "~/providers/card-context-menu/useCardContextMenu";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { FaceDownCard } from "~/components/card/FaceDownCard";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { CardHotKeyOverlay } from "~/components/card/CardHotKeyOverlay";
import { observer } from "mobx-react-lite";

function TopDeckCardComponent({
  card,
  ownerId,
}: {
  card: CardModel;
  ownerId: string;
  count: number;
}) {
  const store = useGameStore();
  const playerId = store.dependencies.playerId;
  const topCard = store.topDeckCard(playerId);
  const isMyTurn = store.isMyTurn;
  const turnPlayer = store.turnPlayer;
  const { enableScope, disableScope } = useHotkeysContext();
  const showHotKey = isMyTurn && ownerId === turnPlayer;
  const hotkeyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isMyTurn) {
      enableScope("deck");
    } else {
      disableScope("deck");
    }
  }, [showHotKey]);
  const { data: user } = useUser();

  const topDropZone = useDropCardInZone(playerId, "deck", "first");
  const bottomDropZone = useDropCardInZone(playerId, "deck", "last");
  const isActive = topDropZone.isActive || bottomDropZone.isActive;
  const isOpponentsCard = playerId !== user?.uid;

  const { dragRef } = useDragCard(topCard, "deck");

  const setContextMenuPosition = useDeckZoneContextMenu();
  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
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

  const element = card?.meta?.revealed ? (
    <LorcanaCardImage instanceId={card.instanceId} />
  ) : (
    <FaceDownCard />
  );

  return (
    <div
      onContextMenu={onContextMenu}
      ref={dragRef}
      className={`${
        showHotKey ? "rounded border-2 border-solid border-amber" : ""
      } group relative flex aspect-card h-fit w-full items-center justify-center hover:border-indigo-500 ${
        isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={() => {
        if (isOpponentsCard) {
          return;
        }

        store.drawCard(playerId);
        logAnalyticsEvent("draw_card");
      }}
    >
      <div
        ref={topDropZone.dropZoneRef}
        className={`${isActive ? "opacity-25" : "opacity-0"} ${
          topDropZone.isOver ? "opacity-50" : ""
        } absolute inset-0 z-10 h-1/2 w-full border-2 border-dashed border-gray-500 bg-white`}
      >
        Top of the deck
      </div>
      <div
        ref={bottomDropZone.dropZoneRef}
        className={`${isActive ? "opacity-25" : "opacity-0"} ${
          bottomDropZone.isOver ? " opacity-50" : ""
        } absolute bottom-0 right-0 z-10 h-1/2 w-full border-2 border-dashed border-gray-500 bg-white`}
      >
        Bottom of the deck
      </div>
      {showHotKey && (
        <div ref={hotkeyRef}>
          <CardHotKeyOverlay
            card={card}
            zone={"deck"}
            index={0}
            callback={openContextMenu}
          />
        </div>
      )}
      {element}
    </div>
  );
}

export const TopDeckCard = observer(TopDeckCardComponent);
