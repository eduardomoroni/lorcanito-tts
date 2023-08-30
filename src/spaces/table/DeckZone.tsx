import React, {
  type FC,
  type MouseEvent,
  useState,
  useEffect,
  useRef,
} from "react";
import { useDragCard, useDropCardInZone } from "~/hooks/dndCard";
import { useUser } from "reactfire";
import { CardCounter } from "~/spaces/table/CardCounter";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { FaceDownCard } from "~/components/card/FaceDownCard";
import { ScryModal } from "~/components/modals/ScryModal";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { CardHotKeyOverlay } from "~/components/card/CardHotKeyOverlay";
import { useHotkeysContext } from "react-hotkeys-hook";
import {
  useGame,
  useGameController,
} from "~/engine/rule-engine/lib/GameControllerProvider";
import { useTurn } from "~/engine/GameProvider";
import { useDeckZoneContextMenu } from "~/providers/card-context-menu/useCardContextMenu";

function everyFourth(n: number) {
  return Math.floor((n - 1) / 4);
}

export const DeckZone: FC<{ cards: string[]; ownerId: string }> = ({
  cards,
  ownerId,
}) => {
  const [scry, setScry] = useState(0);
  const engine = useGameController();
  const topCard = engine.topDeckCard();

  useEffect(() => {
    // TODO: Add a log entry so opponent knowns they're looking at the top X cards
  }, [scry]);

  return (
    <div className="relative flex w-full">
      {scry > 0 && (
        <ScryModal
          onClose={() => {
            setScry(0);
          }}
          open={!!scry}
          cards={cards.slice(-scry)}
        />
      )}

      {cards.map((card, index) => {
        return (
          <DeckCard
            key={index}
            count={cards.length}
            setScry={setScry}
            index={index}
            instanceId={card}
            ownerId={ownerId}
            isTopCard={topCard === card}
          />
        );
      })}
    </div>
  );
};

export function DeckCard(props: {
  index: number;
  instanceId: string;
  setScry: (n: number) => void;
  count: number;
  ownerId: string;
  isTopCard: boolean;
}) {
  const { ownerId, index, isTopCard, instanceId, count, setScry } = props;
  const { data: user } = useUser();
  const isOpponentsCard = ownerId !== user?.uid;

  // TODO: shuffle animation
  // Potentially using react spring
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();

        logAnalyticsEvent("clicking_opponents_deck");
      }}
      style={{
        marginTop: `-${everyFourth(index)}px`,
        marginLeft: `${everyFourth(index)}px`,
      }}
      className={`${
        isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer"
      } group absolute flex aspect-card h-full scale-90 select-none`}
    >
      <CardCounter length={count} />
      {isTopCard ? (
        <TopDeckCard
          instanceId={instanceId}
          count={count}
          setScry={setScry}
          ownerId={ownerId}
        />
      ) : (
        <FaceDownCard />
      )}
    </div>
  );
}

export function TopDeckCard({
  instanceId,
  setScry,
  ownerId,
}: {
  instanceId: string;
  setScry: (n: number) => void;
  ownerId: string;
  count: number;
}) {
  const controller = useGameController();
  const [_, playerId] = useGame();
  const topCard = controller.topDeckCard();
  const { isMyTurn, turnPlayer } = useTurn();
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

  const tableCard = controller.findTableCard(instanceId);

  const { dragRef } = useDragCard(topCard || "", "deck");

  const setContextMenuPosition = useDeckZoneContextMenu(setScry);
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

  const element = tableCard?.meta?.revealed ? (
    <LorcanaCardImage instanceId={instanceId} />
  ) : (
    <FaceDownCard />
  );

  return (
    <div
      onContextMenu={onContextMenu}
      ref={dragRef}
      className={`${
        showHotKey ? "rounded border-2 border-solid border-amber" : ""
      } group relative flex h-full w-full items-center justify-center hover:border-indigo-500 ${
        isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={() => {
        if (isOpponentsCard) {
          return;
        }

        controller.drawCard(playerId);
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
            instanceId={instanceId}
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
