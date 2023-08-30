import React, { type MouseEvent } from "react";
import { type Zones } from "~/providers/TabletopProvider";
import { useDragCard, useDropCardInCard } from "~/hooks/dndCard";
import { useCardPreview } from "~/providers/CardPreviewProvider";
import { useUser } from "reactfire";
import CardContextMenuTrigger from "~/components/CardContextTrigger";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { CardImageDamageOverlay } from "~/components/card/CardImageDamageOverlay";
import { CardNotFound } from "~/components/card/CardNotFound";
import { CardHotKeyOverlay } from "~/components/card/CardHotKeyOverlay";
import { CardImageOverlay } from "~/components/card/CardImageOverlay";
import { useCardContextMenu } from "~/providers/card-context-menu/useCardContextMenu";
import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";
import { useTurn } from "~/engine/GameProvider";

export function CardImage(props: {
  instanceId: string;
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
}) {
  const {
    instanceId,
    onClick,
    zone,
    index,
    isFaceDown,
    className,
    draggable = true,
    grow = "horizontal",
  } = props;
  const engine = useGameController();
  const lorcanitoCard = engine.findLorcanitoCard(instanceId);
  const tableCard = engine.findTableCard(instanceId);
  const ownerId = engine.findCardOwner(instanceId);
  const { isMyTurn, turnPlayer } = useTurn();
  const { openContextMenu } = useCardContextMenu(zone);
  // TODO: when play is draggin the card, change scale to 1.1 to the card seems to be lifted
  const { opacity, dragRef } = useDragCard(instanceId, zone);
  const { dropZoneRef, highlighted, hovered, canShift, canChallenge, canSing } =
    useDropCardInCard(instanceId, zone);

  const setCardPreview = useCardPreview();
  const { data: user } = useUser();
  const showHotKey =
    isMyTurn && ownerId === turnPlayer && (zone === "hand" || zone === "play");

  const tapped = tableCard?.meta?.exerted;
  const isDead =
    zone === "play" &&
    !!tableCard?.meta?.damage &&
    tableCard?.meta?.damage >= (lorcanitoCard?.willpower || 0);
  const isOpponentsCard = ownerId !== user?.uid;
  const isFresh = (zone === "play" && tableCard?.meta?.playedThisTurn) || false;

  const hotKeyBorder = "border-2 border-solid border-amber";
  if (!ownerId || !lorcanitoCard || !tableCard) {
    // console.log(
    //   `CardImage: card not found`,
    //   lorcanitoCard,
    //   tableCard,
    //   instanceId,
    //   ownerId
    // );
    return <CardNotFound />;
  }

  return (
    <div
      ref={(ref) => {
        if (draggable) {
          dragRef(ref);
        }
        if (zone === "play") {
          dropZoneRef(ref);
        }
      }}
      draggable={draggable}
      data-id-card={instanceId}
      onClick={onClick}
      onMouseEnter={() => {
        if (!isFaceDown) {
          setCardPreview({ instanceId, tableId: ownerId });
        }
      }}
      onMouseLeave={() => setCardPreview(undefined)}
      onContextMenu={(event) => openContextMenu(instanceId, event, "top")}
      className={`${showHotKey ? hotKeyBorder : ""} ${
        grow === "horizontal" ? "h-full" : "w-full"
      } ${className || ""} ${
        tapped ? "-translate-x-full rotate-90" : "rotate-0"
      } ${isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer"} ${
        isDead ? "grayscale" : ""
      } ${hovered ? "scale-110" : ""} ${
        highlighted ? "z-20" : ""
      } group relative flex aspect-card origin-bottom-right select-none rounded-lg transition-all ease-linear hover:z-10 hover:border-indigo-500`}
    >
      {zone === "play" && !isOpponentsCard && (
        <div
          className={`absolute left-0 top-0 m-2 opacity-0 group-hover:opacity-100`}
          onClick={(event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            openContextMenu(instanceId, event, "bottom");
          }}
        >
          <CardContextMenuTrigger />
        </div>
      )}
      {highlighted ? (
        <CardImageOverlay isActive={highlighted} isOver={hovered}>
          {canShift ? "SHIFT" : ""}
          {canChallenge ? "CHALLENGE" : ""}
          {canSing ? "SING" : ""}
        </CardImageOverlay>
      ) : null}

      {zone === "play" && (
        <CardImageDamageOverlay
          instanceId={instanceId}
          isFresh={isFresh}
          isDead={isDead}
          className="group-hover:opacity-100"
          zone={zone}
        />
      )}
      {showHotKey && (
        <CardHotKeyOverlay
          instanceId={instanceId}
          zone={zone}
          index={index ?? -1}
        />
      )}
      <LorcanaCardImage
        isFaceDown={isFaceDown}
        style={{ opacity }}
        card={lorcanitoCard}
      />
    </div>
  );
}
