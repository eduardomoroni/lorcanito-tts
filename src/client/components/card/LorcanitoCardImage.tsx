import React, { type MouseEvent, useCallback } from "react";
import { type Zones } from "@lorcanito/engine";
import { useDragCard, useDropCardInCard } from "~/client/hooks/dndCard";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";
import { useUser } from "reactfire";
import { CardImage } from "~/client/components/image/CardImage";
import { CardImageDamageOverlay } from "~/client/components/card/CardImageDamageOverlay";
import { CardNotFound } from "~/client/components/image/CardNotFound";
import { CardHotKeyOverlay } from "~/client/components/card/CardHotKeyOverlay";
import { CardImageOverlay } from "~/client/components/card/CardImageOverlay";
import { useCardContextMenu } from "~/client/providers/card-context-menu/useCardContextMenu";
import { observer } from "mobx-react-lite";
import { CardModel } from "@lorcanito/engine";
import { CardIcons } from "~/client/components/card-icons/CardIcons";
import { CardPopOver } from "~/client/components/card/CardPopOverContent";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import clsx from "clsx";

function CardImageComponent(props: {
  card?: CardModel;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isFaceDown?: boolean;
  className?: string;
  index?: number;
  zone: Zones;
  draggable?: boolean;
  style?: unknown;
  grow?: "horizontal" | "vertical";
  image?: "full" | "image";
  enablePopOver?: boolean;
}) {
  const {
    card,
    onClick,
    zone,
    index,
    isFaceDown,
    className,
    draggable = false,
    grow = "horizontal",
    image = "full",
    enablePopOver,
  } = props;
  const lorcanitoCard = card?.lorcanitoCard;
  const ownerId = card?.ownerId;

  if (!ownerId || !lorcanitoCard || !card) {
    return <CardNotFound />;
  }

  const store = useGameStore();
  const isMyTurn = store.turnPlayer === store.activePlayer;
  const turnPlayer = store.activePlayer;
  const { openContextMenu, isContextMenuOpen } = useCardContextMenu(zone);
  // TODO: when play is draggin the card, change scale to 1.1 to the card seems to be lifted
  const { dragRef, isDragging } = useDragCard(zone, card);
  const { dropZoneRef, highlighted, hovered, canShift, canChallenge, canSing } =
    useDropCardInCard(card, zone);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const setCardPreview = useSetCardPreview();
  const { data: user } = useUser();
  const showHotKey =
    isMyTurn && ownerId === turnPlayer && (zone === "hand" || zone === "play");

  const meta = card.meta;
  const tapped = meta?.exerted;
  const isDead =
    zone === "play" &&
    !!meta?.damage &&
    meta?.damage >= (lorcanitoCard?.willpower || 0);
  const isOpponentsCard = ownerId !== user?.uid;

  const hotKeyBorder = "border-2 border-solid border-amber";

  const finalDraggable = draggable;

  const openMenuCallback = useCallback(() => {
    openContextMenu(
      card,
      wrapperRef.current,
      zone === "play" ? "bottom" : "top",
    );
  }, []);

  return (
    <div
      data-id-card={card.instanceId}
      data-testid={card.instanceId}
      className={clsx(
        "group relative flex origin-bottom-right select-none rounded-lg transition-all ease-linear",
        tapped ? "-translate-x-full rotate-90" : "rotate-0",
        image === "full" ? "aspect-card" : "aspect-card-image-name",
        tapped ? "-translate-x-full rotate-90 grayscale-[50%]" : "rotate-0",
        card.meta.playedThisTurn && card.type === "character" && "saturate-200",
        className,
      )}
      onClick={(event) => {
        // This was preventing the card from being selected when altering hand
        // if (!store.manualMode && (!isMyTurn || isOpponentsCard)) {
        //   return;
        // }

        if (onClick) {
          onClick(event);
        }

        if (!onClick) {
          openContextMenu(card, event, "top");
        }
      }}
    >
      <div
        draggable={finalDraggable}
        ref={(ref) => {
          if (!store.hasPriority) {
            return;
          }

          if (finalDraggable && dragRef) {
            dragRef(ref);
          }

          if (zone === "play") {
            dropZoneRef(ref);
          }
        }}
        onMouseEnter={() => {
          if (!isFaceDown) {
            setCardPreview({ card: card?.lorcanitoCard });
          }
        }}
        onMouseLeave={() => setCardPreview(undefined)}
        onContextMenu={(event) => {
          if (!store.hasPriority || isOpponentsCard) {
            return;
          }

          openContextMenu(card, event, "top");
        }}
        className={clsx(
          "group relative box-border flex origin-bottom-right select-none rounded-lg transition-all ease-linear hover:z-10 hover:border-indigo-500",
          grow === "horizontal" ? "h-full" : "w-full",
          isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer",
          hovered ? "scale-110" : "",
          isDead ? "grayscale" : "",
          image === "full" ? "aspect-card" : "aspect-card-image-name",
          highlighted ? "z-20" : "",
          showHotKey ? hotKeyBorder : "",
        )}
      >
        <CardPopOver
          card={card}
          owner={user?.uid}
          disabled={!enablePopOver || isDragging || isContextMenuOpen || !zone}
        >
          <div className="relative w-full">
            {!card.lorcanitoCard.implemented ? (
              <CardImageOverlay isActive={true} isOver={false}>
                NOT IMPLEMENTED
              </CardImageOverlay>
            ) : null}
            {highlighted ? (
              <CardImageOverlay isActive={highlighted} isOver={hovered}>
                {canShift ? "SHIFT" : ""}
                {canChallenge ? "CHALLENGE" : ""}
                {canSing ? "SING" : ""}
              </CardImageOverlay>
            ) : null}
            {zone === "play" && card.type === "character" && (
              <CardImageDamageOverlay
                card={card}
                zone={zone}
                className="group-hover:opacity-100"
              />
            )}
            {showHotKey && (
              <CardHotKeyOverlay
                card={card}
                zone={zone}
                index={index ?? -1}
                callback={openMenuCallback}
                ref={wrapperRef}
              />
            )}
            {zone === "play" && card.type === "character" ? (
              <CardIcons card={card} />
            ) : null}
            <CardImage
              isFaceDown={isFaceDown}
              className={clsx(isDragging && "opacity-50")}
              hideCardText={image === "image"}
              cardSet={lorcanitoCard.set}
              cardNumber={lorcanitoCard.number}
            />
          </div>
        </CardPopOver>
      </div>
    </div>
  );
}

export const LorcanitoCardImage = observer(CardImageComponent);
