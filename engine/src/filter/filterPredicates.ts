import type { LorcanitoCard } from "@lorcanito/engine/cards/cardTypes";
import type { MobXRootStore } from "@lorcanito/engine/store/RootStore";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import {
  isNumericComparison,
  isStringComparison,
} from "@lorcanito/engine/filter/filters";
import { exhaustiveCheck } from "@lorcanito/engine/lib/exhaustiveCheck";
import type { Characteristics } from "@lorcanito/engine/cards/characteristics";
import type { NumericComparison } from "@lorcanito/engine/filter/numericComparison";
import type { StringComparison } from "@lorcanito/engine/filter/stringComparison";
import type { TargetFilter } from "@lorcanito/engine/filter/targetFilter";

export const computeNumericOperator = (
  numericComparison: NumericComparison,
  numericValueToCompare: number,
): boolean => {
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
};

export function applyAllCardFilters(
  activeFilters: TargetFilter[],
  player: string,
  store: MobXRootStore,
  source?: CardModel,
) {
  const playerId = player || store.activePlayer;

  function predicate(card: CardModel) {
    // TODO: If we change this semantic to ALL cards instead of no cards, search for occurences and update them
    // or else drag&drop will break
    if (activeFilters.length === 0) {
      return false;
    }

    if (card.meta.shifted && card.instanceId === card.meta.shifted) {
      return false;
    }

    return activeFilters.every((filter: TargetFilter): boolean => {
      const lorcanitoCard = card.lorcanitoCard;
      const activeFilter = filter.filter;

      switch (activeFilter) {
        case "zone": {
          const { value } = filter;

          if (Array.isArray(value)) {
            return value.includes(card.zone);
          } else {
            return value === card.zone;
          }
        }
        case "owner": {
          const { value } = filter;
          return filterByOwner(value, playerId, card);
        }
        case "status": {
          if (filter.value === "damage" && "comparison" in filter) {
            return computeNumericOperator(
              filter.comparison,
              card.meta.damage || 0,
            );
          }

          if (filter.value === "ready") {
            return !card.meta?.exerted;
          }

          if (filter.value === "exerted") {
            return !!card.meta?.exerted;
          }

          if (filter.value === "dry") {
            return !card.meta?.playedThisTurn;
          }

          return false;
        }
        case "type": {
          const value = filter.value;
          if (Array.isArray(value)) {
            return filter.value.includes(lorcanitoCard?.type);
          } else {
            return value === lorcanitoCard?.type;
          }
        }
        case "attribute": {
          const { value } = filter;
          return filterByAttribute(value, filter.comparison, lorcanitoCard);
        }
        case "characteristics": {
          const { value, conjunction } = filter;
          return filterByCharacteristics(value, card, conjunction);
        }
        case "ability": {
          const { value } = filter;
          // TODO: This is wrong, as glimmers may acquire abilities
          // We have to fix an infinite loop here
          // return card.hasAbility(value);
          return card.hasNativeAbility(value);
        }
        case "source": {
          const { value } = filter;

          if (!source) {
            console.warn("Source not found, this is likely a mistake", filter);
            return false;
          }

          if (value === "self") {
            return card.instanceId === source.instanceId;
          }

          // TODO: Find a better way of doing this
          // Gruesome and Grim
          if (value === "target") {
            return true;
          }

          return false;
        }
        case "top-deck": {
          const { value } = filter;
          const targetPlayer =
            value === "self" ? playerId : store.opponentPlayer(playerId);

          const topCard = store.tableStore.getTopDeckCard(targetPlayer);
          return topCard?.instanceId === card.instanceId;
        }
        case "instanceId": {
          const { value } = filter;
          const found = store.cardStore.getCard(value);
          return card.instanceId === found?.instanceId;
        }
        case "challenge": {
          console.warn("NOT IMPLEMENTED");
          console.log(
            "Challenge filter should have been replaced by instanceId filter",
          );
          return false;
        }
        case "was-challenged": {
          let found = false;

          // TODO: This could be the table of the active player actually
          store.tableStore.getTables().forEach((table) => {
            table.turn.challenges.forEach((challenge) => {
              if (challenge.defender.instanceId === card.instanceId) {
                console.log(challenge.defender.fullName);
                found = true;
              }
            });
          });

          return found;
        }
        case "can": {
          const { value } = filter;
          if (!source) {
            console.warn("Something is wrong, source must be present");
            return false;
          }

          switch (value) {
            case "challenge": {
              return card.canBeChallenged(source);
            }
            case "shift": {
              return source.canShiftInto(card);
            }
            case "sing": {
              return card.canSing(source);
            }
            default: {
              exhaustiveCheck(value);
              return false;
            }
          }
        }
        case "turn": {
          const { value, targetFilter, comparison } = filter;
          const table = store.tableStore.getTable(source?.ownerId);
          if (!table) {
            return false;
          }

          switch (value) {
            case "cardsPlayed": {
              const cardsPlayed = table.turn.cardsPlayed.filter((card) =>
                card.isValidTarget(targetFilter, source?.ownerId, source),
              ).length;

              return computeNumericOperator(comparison, cardsPlayed);
            }
            default: {
              exhaustiveCheck(value);
              return false;
            }
          }
        }
      }
    });
  }

  return predicate;
}

export function filterByOwner(
  value: "self" | "opponent" | string,
  playerId: string,
  card: CardModel,
): boolean {
  if (value === "opponent") {
    return card.ownerId !== playerId;
  } else if (value === "self") {
    return card.ownerId === playerId;
  } else {
    return value === card.ownerId;
  }
}

export function filterByAttribute(
  value: "cost" | "name" | "title" | "strength",
  comparison: NumericComparison | StringComparison,
  card?: LorcanitoCard,
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
    return computeNumericOperator(comparison, attribute);
  }

  return false;
}

function filterByCharacteristics(
  value: Characteristics[],
  card?: CardModel,
  conjunction: "and" | "or" = "and",
): boolean {
  if (!card) {
    return false;
  }

  if (conjunction === "and") {
    return value.every((characteristic) => {
      return card.lorcanitoCard.characteristics?.includes(characteristic);
    });
  }

  if (conjunction === "or") {
    return value.some((characteristic) => {
      return card.lorcanitoCard.characteristics?.includes(characteristic);
    });
  }

  return false;
}
