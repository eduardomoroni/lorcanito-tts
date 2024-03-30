import { useDrag, useDrop } from "react-dnd";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import type { CardModel, Zones } from "@lorcanito/engine";
import { useGameController } from "~/client/hooks/useGameController";

export const ItemTypes = {
  CARD: "card",
};

type CardItemType = {
  card?: CardModel;
  from: Zones;
};

// TODO: Major issue with moving
// the dep array holds the game in a prior state
export function useDragCard(zone: Zones, card?: CardModel) {
  if (!card) {
    return { isDragging: false, dragRef: null };
  }

  const item: CardItemType = { card: card, from: zone };
  const [collect, dragRef] = useDrag(
    () => ({
      item,
      type: ItemTypes.CARD,
      collect: (monitor) => {
        return {
          isDragging: monitor.isDragging(),
        };
      },
    }),
    [zone, card],
  );

  return { isDragging: collect.isDragging, dragRef };
}

export function useDropCardInCard(droppingCard: CardModel, zone?: Zones) {
  const controller = useGameController();

  const [
    { highlighted, hovered, canShift, canChallenge, canSing },
    dropZoneRef,
  ] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      canDrop: (dragging: CardItemType) => {
        if (
          !dragging ||
          dragging.card?.isCard(droppingCard) ||
          droppingCard.zone !== "play"
        ) {
          return false;
        }

        // const canShift = droppingCard.canShiftInto(dragging.card);
        // const canChallenge = droppingCard.canChallenge(dragging.card);
        // const canSing = droppingCard.canSing(dragging.card);
        const canShift = false;
        const canChallenge = false;
        const canSing = false;

        return canShift || canChallenge || canSing;
      },
      drop: (dragging: CardItemType) => {
        // const canShift = droppingCard.canShiftInto(dragging.card);
        // const canChallenge = droppingCard.canChallenge(dragging.card);
        // const canSing = droppingCard.canSing(dragging.card);
        const canShift = false;
        const canChallenge = false;
        const canSing = false;

        if (canShift) {
          controller.findShiftTarget(dragging.card, droppingCard);
        }

        if (canChallenge) {
          controller.findChallengeTarget(dragging.card, droppingCard);
        }

        if (canSing) {
          controller.findSingTarget(droppingCard, dragging.card);
        }

        return {
          dragging: dragging,
          dropping: droppingCard,
          shift: canShift,
          challenge: canChallenge,
          sing: canSing,
        };
      },
      collect: (monitor) => {
        const dragging = monitor.getItem();

        if (
          !dragging ||
          dragging?.card?.isCard(droppingCard) ||
          droppingCard.zone !== "play"
        ) {
          return {
            canShift: false,
            canChallenge: false,
            canSing: false,
            hovered: false,
            highlighted: false,
          };
        }

        const canShift = droppingCard.canShiftInto(dragging?.card);
        const canChallenge = droppingCard.canChallenge(dragging?.card);
        const canSing = droppingCard.canSing(dragging?.card);

        return {
          canShift,
          canChallenge,
          canSing,
          hovered: monitor.isOver({ shallow: true }),
          highlighted: monitor.canDrop(),
        };
      },
    }),
    // TODO: Revisit this
    [zone, droppingCard, controller],
  );

  return {
    dropZoneRef,
    highlighted,
    hovered,
    canShift,
    canChallenge,
    canSing,
  };
}

export function useDropCardInZone(
  playerId: string,
  zone: Zones,
  position: "first" | "last" = "last",
) {
  const controller = useGameController();
  const [{ isActive, isOver }, dropZoneRef] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      drop: (item: CardItemType, monitor) => {
        if (!item.card) {
          return {
            to: zone,
            from: item.from,
            card: item.card,
          };
        }

        if (!monitor.isOver({ shallow: true })) {
          logAnalyticsEvent("card_drop_outside_zone");
          return;
        } else {
          logAnalyticsEvent("card_drop_in_zone", { from: item.from, to: zone });

          if (zone === "play" && item.from === "hand") {
            controller.playCard(item.card);
          } else if (zone === "inkwell" && item.from === "hand") {
            controller.addToInkwell(item.card);
          } else if (controller.manualMode) {
            controller.manualMoves.moveCardTo(item.card, zone, position);
          }

          return {
            to: zone,
            from: item.from,
            card: item.card,
          };
        }
      },
      canDrop: (item: CardItemType) => {
        if (controller.manualMode) {
          return item.from !== zone && item.card?.ownerId === playerId;
        }

        return (
          item.from !== zone &&
          item.card?.ownerId === playerId &&
          ["inkwell", "play"].includes(zone)
        );
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver({ shallow: true }),
          isActive: monitor.canDrop(),
        };
      },
    }),
    // TODO: Revisit this
    [playerId, zone, position, controller],
  );

  return { dropZoneRef, isActive, isOver };
}
