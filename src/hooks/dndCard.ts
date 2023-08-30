import { type Zones } from "~/providers/TabletopProvider";
import { useDrag, useDrop } from "react-dnd";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import {
  canSingFilter,
  challengeOpponentsCardsFilter,
} from "~/components/modals/target/filters";
import {
  type GameEngine,
  useGame,
  useGameController,
} from "~/engine/rule-engine/lib/GameControllerProvider";

export const ItemTypes = {
  CARD: "card",
  DAMAGE: "damage_counter",
};

type CardItemType = {
  card: string;
  from: Zones;
};

// TODO: Major issue with moving
// the dep array holds the game in a prior state

export function useDragCard(instanceID: string, zone: Zones) {
  const game = useGame();
  const item: CardItemType = { card: instanceID, from: zone };

  // TODO: add a cool effect on drag
  const [collect, dragRef] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item,
      collect: (monitor) => {
        return {
          opacity: monitor.isDragging() ? 0.5 : 1,
        };
      },
    }),
    [zone, game]
  );

  return { opacity: collect.opacity, dragRef };
}

export function useDropCardInCard(droppingCard: string, zone: Zones) {
  const game = useGame();
  const engine = useGameController();

  const [
    { highlighted, hovered, canShift, canChallenge, canSing },
    dropZoneRef,
  ] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      canDrop: (dragging: CardItemType) => {
        if (dragging.card === droppingCard) {
          return false;
        }

        const canShift = canShiftIntoCard(engine, dragging, droppingCard, zone);
        const canChallenge = canChallengeCard(
          engine,
          droppingCard,
          dragging.from
        );
        const canSing = canSingCard(engine, droppingCard, dragging.card);

        return canShift || canChallenge || canSing;
      },
      drop: (dragging: CardItemType) => {
        const canShift = canShiftIntoCard(engine, dragging, droppingCard, zone);
        const canChallenge = canChallengeCard(
          engine,
          droppingCard,
          dragging.from
        );
        const canSing = canSingCard(engine, droppingCard, dragging.card);

        if (canShift) {
          engine.shift(dragging.card, droppingCard);
        }

        if (canChallenge) {
          engine.challenge(dragging.card, droppingCard);
        }

        if (canSing) {
          engine.sing(dragging.card, droppingCard);
        }

        return {
          dragging: dragging.card,
          dropping: droppingCard,
          shift: canShift,
          challenge: canChallenge,
          sing: canSing,
        };
      },
      collect: (monitor) => {
        const item = monitor.getItem();

        const canShift = canShiftIntoCard(engine, item, droppingCard, zone);
        const canChallenge = canChallengeCard(engine, droppingCard, item?.from);
        const canSing = canSingCard(engine, droppingCard, item?.card);

        return {
          canShift,
          canChallenge,
          canSing,
          hovered: monitor.isOver({ shallow: true }),
          highlighted: monitor.canDrop(),
        };
      },
    }),
    [zone, droppingCard, engine, game]
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
  position: "first" | "last" = "last"
) {
  const game = useGame();
  const controller = useGameController();
  const [{ isActive, isOver }, dropZoneRef] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      drop: (item: CardItemType, monitor) => {
        if (!monitor.isOver({ shallow: true })) {
          logAnalyticsEvent("card_drop_outside_zone");
          return;
        } else {
          logAnalyticsEvent("card_drop_in_zone", { from: item.from, to: zone });

          if (zone === "play" && item.from === "hand") {
            controller.playCardFromHand(item.card);
          } else if (zone === "inkwell" && item.from === "hand") {
            controller.addToInkwell(item.card, item.from);
          } else {
            controller.moveCard({
              instanceId: item.card,
              from: item.from,
              to: zone,
              position,
            });
          }

          return {
            to: zone,
            from: item.from,
            card: item.card,
          };
        }
      },
      canDrop: (item: CardItemType) => {
        return (
          item.from !== zone && controller.findCardOwner(item.card) === playerId
        );
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver({ shallow: true }),
          isActive: monitor.canDrop(),
        };
      },
    }),
    [playerId, zone, position, controller, game]
  );

  return { dropZoneRef, isActive, isOver };
}

// TODO: Move this to filter syntax
export function canShiftIntoCard(
  engine: GameEngine,
  dragging: CardItemType,
  droppingCard: string,
  zone: Zones
): boolean {
  if (!dragging) {
    return false;
  }

  const shifterCard = engine.findLorcanitoCard(dragging.card);
  const shiftedCard = engine.findLorcanitoCard(droppingCard);

  // WHen card in card drag&drop is also active, z-index of the card is higher
  if (dragging.card === droppingCard || zone !== "play") {
    return false;
  }

  const shiftCost = engine.findShiftCost(dragging.card);
  // TODO: In order to makee this work, we need to update the closure based on card metadata so the closure is updated
  const isAlreadyShifted = engine.findTableCard(droppingCard)?.meta?.shifted;

  if (isAlreadyShifted || !shiftCost) {
    return false;
  }

  return shifterCard?.name === shiftedCard?.name;
}

function canChallengeCard(
  engine: GameEngine,
  droppingCard: string,
  zone?: Zones
) {
  if (!droppingCard || zone !== "play") {
    return false;
  }

  return engine
    .getCardsByFilter(challengeOpponentsCardsFilter)
    .map((card) => card?.instanceId)
    .includes(droppingCard);
}

function canSingCard(
  engine: GameEngine,
  droppingCard?: string,
  draggingCard?: string
) {
  // I'm doing this to avoid running the filter
  const card = engine.findLorcanitoCard(draggingCard);
  if (!droppingCard || !draggingCard || card?.type !== "action" || !card) {
    return false;
  }

  const filters = canSingFilter(card);
  return engine
    .getCardsByFilter(filters)
    .map((card) => card?.instanceId)
    .includes(droppingCard);
}
