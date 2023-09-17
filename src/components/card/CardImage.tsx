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
import { useTurn } from "~/engine/GameProvider";
import { observer } from "mobx-react-lite";
import { CardModel } from "~/store/models/CardModel";
import { CardIcons } from "~/components/card-icons/CardIcons";

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
}) {
  const {
    card,
    onClick,
    zone,
    index,
    isFaceDown,
    className,
    draggable = true,
    grow = "horizontal",
    image = "full",
  } = props;
  const lorcanitoCard = card?.lorcanitoCard;
  const ownerId = card?.ownerId;

  if (!ownerId || !lorcanitoCard || !card) {
    return <CardNotFound />;
  }

  const { isMyTurn, turnPlayer } = useTurn();
  const { openContextMenu } = useCardContextMenu(zone);
  // TODO: when play is draggin the card, change scale to 1.1 to the card seems to be lifted
  const { opacity, dragRef } = useDragCard(card, zone);
  const { dropZoneRef, highlighted, hovered, canShift, canChallenge, canSing } =
    useDropCardInCard(card, zone);

  const setCardPreview = useCardPreview();
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
      data-id-card={card.instanceId}
      onClick={onClick}
      onMouseEnter={() => {
        if (!isFaceDown) {
          setCardPreview({ instanceId: card.instanceId, tableId: ownerId });
        }
      }}
      onMouseLeave={() => setCardPreview(undefined)}
      onContextMenu={(event) => openContextMenu(card, event, "top")}
      className={`${showHotKey ? hotKeyBorder : ""} ${
        grow === "horizontal" ? "h-full" : "w-full"
      } ${className || ""} ${
        tapped ? "-translate-x-full rotate-90" : "rotate-0"
      } ${isOpponentsCard ? "cursor-not-allowed" : "cursor-pointer"} ${
        isDead ? "grayscale" : ""
      } ${hovered ? "scale-110" : ""} ${highlighted ? "z-20" : ""} ${
        image === "full" ? "aspect-card" : "aspect-card-image-name"
      } group relative flex origin-bottom-right select-none rounded-lg transition-all ease-linear hover:z-10 hover:border-indigo-500`}
    >
      {zone === "play" && !isOpponentsCard && (
        <div
          className={`absolute left-0 top-0 m-2 opacity-0 group-hover:opacity-100`}
          onClick={(event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            openContextMenu(card, event, "bottom");
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

      {zone === "play" && card.type === "character" && (
        <CardImageDamageOverlay
          card={card}
          zone={zone}
          className="group-hover:opacity-100"
        />
      )}
      {showHotKey && (
        <CardHotKeyOverlay card={card} zone={zone} index={index ?? -1} />
      )}
      {zone === "play" && card.type === "character" ? (
        <CardIcons card={card} />
      ) : null}
      <LorcanaCardImage
        isFaceDown={isFaceDown}
        style={{ opacity }}
        card={lorcanitoCard}
        hideCardText={image === "image"}
      />
    </div>
  );
}

export const CardImage = observer(CardImageComponent);
