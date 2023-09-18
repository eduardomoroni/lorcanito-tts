import type {NumericComparison, StringComparison, TargetFilter,} from "~/components/modals/target/filters";
import {
  Abilities,
  AttributeFilterValue,
  isNumericComparison,
  isStringComparison,
  Keywords,
  OwnerFilterValue,
  StatusFilter,
  StatusFilterValues,
} from "~/components/modals/target/filters";
import {exhaustiveCheck} from "~/libs/exhaustiveCheck";
import {Characteristics, LorcanitoCard} from "~/engine/cardTypes";
import {MobXRootStore} from "~/store/RootStore";
import {CardModel} from "~/store/models/CardModel";
import {keys} from "mobx";
import {Zones} from "~/providers/TabletopProvider";

const computeNumericOperator = (
    numericComparison: NumericComparison,
    numericValueToCompare: number): boolean => {
  const operator = numericComparison.operator;
  switch (operator) {
    case "eq": {
      return numericValueToCompare === numericComparison.value;
    }
    case "gt": {
      return numericValueToCompare > numericComparison.value;
    }
    case "gte": {
      return numericValueToCompare >= numericComparison.value;
    }
    case "lt": {
      return numericValueToCompare < numericComparison.value;
    }
    case "lte": {
      return numericValueToCompare <= numericComparison.value;
    }
    default: {
      exhaustiveCheck(operator);
      return false;
    }
  }
}

export function applyAllCardFilters(
  activeFilters: TargetFilter[],
  player: string,
  store: MobXRootStore
) {
  const playerId = player || store.activePlayer;

  function predicate(card: CardModel) {
    // TODO: If we change this semantic to ALL cards instead of no cards, search for occurences and update them
    // or else drag&drop will break
    if (activeFilters.length === 0) {
      return false;
    }

    return activeFilters.every((filter): boolean => {
      const lorcanitoCard = card.lorcanitoCard;
      const activeFilter = filter.filter;

      switch (activeFilter) {
        case "zone": {
          const players = keys(store.tableStore.tables) as string[];
          let includes = false;

          players.forEach((player) => {
            const playerZone = store.tableStore.getPlayerZone(
              player,
              filter.value as Zones
            );
            if (playerZone?.hasCard(card)) {
              includes = true;
            }
          });
          return includes;
        }
        case "owner": {
          return filterByOwner(
            filter.value as OwnerFilterValue,
            playerId,
            card
          );
        }
        case "status": {
          return filterByStatus(filter as StatusFilter, card);
        }
        case "type": {
          if (Array.isArray(filter.value)) {
            return filter.value.includes(lorcanitoCard?.type);
          } else {
            return filter.value === lorcanitoCard?.type;
          }
        }
        case "attribute": {
          return filterByAttribute(
            filter.value as AttributeFilterValue,
            filter.comparison,
            lorcanitoCard
          );
        }
        case "keyword": {
          return filterByKeyword(filter.value as Keywords, card);
        }
        case "characteristics": {
          return filterByCharacteristics(
            filter.value as Characteristics[],
            card
          );
        }
        case "ability": {
          return card.hasAbility(filter.value as Abilities);
        }
        default: {
          exhaustiveCheck(activeFilter);
          return true;
        }
      }
    });
  }

  return predicate;
}

export function filterByOwner(
  value: OwnerFilterValue,
  playerId: string,
  card: CardModel
): boolean {
  if (value === "opponent") {
    return card.ownerId !== playerId;
  } else if (value === "self") {
    return card.ownerId === playerId;
  } else {
    return value === card.ownerId;
  }
}

export function filterByStatus(
  filter: StatusFilter,
  card: CardModel,
): boolean {
  if (filter.value === StatusFilterValues.READY) {
    return !card.meta?.exerted;
  }

  if (filter.value === StatusFilterValues.EXERTED) {
    return !!card.meta?.exerted;
  }

  if (filter.value === StatusFilterValues.DRY) {
    return !card.meta?.playedThisTurn;
  }

  if (filter.value === StatusFilterValues.DAMAGE && typeof card.meta.damage === "number") {
    return computeNumericOperator(filter.comparison, card.meta.damage)
  }

  return false;
}

export function filterByAttribute(
  value: AttributeFilterValue,
  comparison: NumericComparison | StringComparison,
  card?: LorcanitoCard
): boolean {
  if (!card) {
    return false;
  }

  let attribute = card[value];

  if (!attribute) {
    return false;
  }

  if (isStringComparison(comparison) && typeof attribute === "string") {
    comparison.value = comparison.value.toLocaleLowerCase();
    return (
      comparison.value.toLocaleLowerCase() === attribute.toLocaleLowerCase()
    );
  }

  if (isNumericComparison(comparison) && typeof attribute === "number") {
    return computeNumericOperator(comparison, attribute)
  }

  return false;
}

function filterByKeyword(value: Keywords, card?: CardModel): boolean {
  if (!card) {
    return false;
  }

  switch (value) {
    case "bodyguard": {
      return card.hasBodyguard;
    }
    case "reckless": {
      return card.hasReckless;
    }
    case "evasive": {
      return card.hasEvasive;
    }
    case "challenger": {
      return card.hasChallenger;
    }
    case "singer": {
      return card.hasSinger;
    }
    case "rush": {
      return card.hasRush;
    }
    case "ward": {
      return card.hasWard;
    }
    case "shift": {
      return card.hasShift;
    }
    case "support": {
      return card.hasSupport;
    }
    default: {
      exhaustiveCheck(value);
      return false;
    }
  }
}

function filterByCharacteristics(
  value: Characteristics[],
  card?: CardModel
): boolean {
  if (!card) {
    return false;
  }

  return value.every((characteristic) => {
    return card.lorcanitoCard.characteristics?.includes(characteristic);
  });
}
