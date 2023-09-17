import { type Zones } from "~/providers/TabletopProvider";
import { useDrag, useDrop } from "react-dnd";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import {
  canSingFilter,
  challengeOpponentsCardsFilter,
} from "~/components/modals/target/filters";
import { useGameStore } from "~/engine/rule-engine/lib/GameStoreProvider";
import { CardModel } from "~/store/models/CardModel";
import { MobXRootStore } from "~/store/RootStore";

export const ItemTypes = {
  CARD: "card",
};

type CardItemType = {
  card?: CardModel;
  from: Zones;
};

// TODO: Major issue with moving
// the dep array holds the game in a prior state

export function useDragCard(card: CardModel | undefined, zone: Zones) {
  const store = useGameStore();
  const item: CardItemType = { card: card, from: zone };

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
    // TODO: Revisit this
    [zone, store.toJSON()]
  );

  return { opacity: collect.opacity, dragRef };
}

export function useDropCardInCard(droppingCard: CardModel, zone: Zones) {
  const store = useGameStore();

  const [
    { highlighted, hovered, canShift, canChallenge, canSing },
    dropZoneRef,
  ] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      canDrop: (dragging: CardItemType) => {
        if (dragging.card?.isCard(droppingCard)) {
          return false;
        }

        const canShift = canShiftIntoCard(store, dragging, droppingCard, zone);
        const canChallenge = canChallengeCard(
          store,
          droppingCard,
          dragging.from
        );
        const canSing = canSingCard(store, droppingCard, dragging.card);

        return canShift || canChallenge || canSing;
      },
      drop: (dragging: CardItemType) => {
        const canShift = canShiftIntoCard(store, dragging, droppingCard, zone);
        const canChallenge = canChallengeCard(
          store,
          droppingCard,
          dragging.from
        );
        const canSing = canSingCard(store, droppingCard, dragging.card);

        if (canShift) {
          store.shiftCard(dragging.card?.instanceId, droppingCard.instanceId);
        }

        if (canChallenge) {
          store.cardStore.challenge(
            dragging.card?.instanceId,
            droppingCard.instanceId
          );
        }

        if (canSing) {
          droppingCard.sing(dragging.card);
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
        const item = monitor.getItem();

        const canShift = canShiftIntoCard(store, item, droppingCard, zone);
        const canChallenge = canChallengeCard(store, droppingCard, item?.from);
        const canSing = canSingCard(store, droppingCard, item?.card);

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
    [zone, droppingCard, store.toJSON()]
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
  const store = useGameStore();
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
            store.playCardFromHand(item.card?.instanceId || "");
          } else if (zone === "inkwell" && item.from === "hand") {
            store.tableStore.addToInkwell(item.card?.instanceId || "");
          } else {
            store.tableStore.moveCard(
              item.card?.instanceId,
              item.from,
              zone,
              position
            );
          }

          return {
            to: zone,
            from: item.from,
            card: item.card,
          };
        }
      },
      canDrop: (item: CardItemType) => {
        return item.from !== zone && item.card?.ownerId === playerId;
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver({ shallow: true }),
          isActive: monitor.canDrop(),
        };
      },
    }),
    // TODO: Revisit this
    [playerId, zone, position, store.toJSON()]
  );

  return { dropZoneRef, isActive, isOver };
}

export function canShiftIntoCard(
  store: MobXRootStore,
  dragging: CardItemType,
  droppingCard: CardModel,
  zone: Zones
): boolean {
  if (zone !== "play") {
    return false;
  }

  if (!dragging || !droppingCard) {
    return false;
  }

  if (dragging.card?.lorcanitoCard.name !== droppingCard.lorcanitoCard.name) {
    return false;
  }

  // WHen card in card drag&drop is also active, z-index of the card is higher
  if (dragging.card === droppingCard) {
    return false;
  }

  return dragging.card.canShiftInto(droppingCard);
}

function canChallengeCard(
  store: MobXRootStore,
  droppingCard?: CardModel,
  zone?: Zones
) {
  if (!droppingCard || zone !== "play") {
    return false;
  }

  return store.cardStore
    .getCardsByFilter(challengeOpponentsCardsFilter)
    .map((card) => card?.instanceId)
    .includes(droppingCard.instanceId);
}

function canSingCard(
  store: MobXRootStore,
  droppingCard?: CardModel,
  draggingCard?: CardModel
) {
  // I'm doing this to avoid running the filter
  const card = draggingCard?.lorcanitoCard;
  if (!droppingCard || !draggingCard || card?.type !== "action" || !card) {
    return false;
  }

  const filters = canSingFilter(card);
  return droppingCard?.canSing(draggingCard);
}
