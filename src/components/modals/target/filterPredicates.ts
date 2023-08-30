import type { TableCard } from "~/providers/TabletopProvider";
import type {
  NumericComparison,
  TargetFilter,
} from "~/components/modals/target/filters";
import { exhaustiveCheck } from "~/libs/exhaustiveCheck";
import type { Engine } from "~/engine/rule-engine/engine";
import { RootState } from "~/engine/redux";
import {
  selectCardOwner,
  selectPlayers,
  selectPlayerZone,
} from "~/engine/rule-engine/lorcana/selectors";
import { allCardsById } from "~/engine/cards";
import {
  bodyguardAbilityPredicate,
  LorcanitoCard,
  shiftAbilityPredicate,
} from "~/engine/cardTypes";
import { Keywords } from "~/components/modals/target/filters";

export function selectByFilter(
  activeFilters: TargetFilter[],
  playerId: string
) {
  return function selector(state: { game: RootState["game"] }): TableCard[] {
    if (activeFilters.length === 0) {
      return [];
    }

    return Object.values(state.game.cards || {}).filter((card: TableCard) => {
      return activeFilters.every((filter): boolean => {
        const lorcanitoCard = allCardsById[card.cardId];

        const activeFilter = filter.filter;

        switch (activeFilter) {
          case "zone": {
            const players = selectPlayers(state);
            let zoneCards: string[] = [];
            players.forEach((player) => {
              zoneCards = zoneCards.concat(
                selectPlayerZone(state.game, player, filter.value)
              );
            });

            return zoneCards.includes(card.instanceId);
          }
          case "owner": {
            const owner = selectCardOwner(state, card.instanceId);
            return filterByOwner(filter.value, playerId, card, owner);
          }
          case "status": {
            return filterByStatus(filter.value, card);
          }
          case "type": {
            return lorcanitoCard?.type === filter.value;
          }
          case "keyword": {
            return filterByKeyword(filter.value, lorcanitoCard);
          }
          case "attribute": {
            return filterByAttribute(
              filter.value,
              filter.comparison,
              lorcanitoCard
            );
          }
          default: {
            exhaustiveCheck(activeFilter);
            return false;
          }
        }
      });
    });
  };
}

export function applyAllCardFilters(
  activeFilters: TargetFilter[],
  engine: Engine,
  playerId: string
) {
  function predicate(card: TableCard) {
    // TODO: If we change this semantic to ALL cards instead of no cards, search for occurences and update them
    // or else drag&drop will break
    if (activeFilters.length === 0) {
      return false;
    }

    return activeFilters.every((filter): boolean => {
      const lorcanitoCard = engine.get.lorcanitoCard(card.instanceId);

      const activeFilter = filter.filter;
      switch (activeFilter) {
        case "zone": {
          const players = engine.get.players();
          let zoneCards: string[] = [];
          players.forEach((player) => {
            zoneCards = zoneCards.concat(
              engine.get.zoneCards(filter.value, player)
            );
          });

          return zoneCards.includes(card.instanceId);
        }
        case "owner": {
          return filterByOwner(filter.value, playerId, card);
        }
        case "status": {
          return filterByStatus(filter.value, card);
        }
        case "type": {
          return lorcanitoCard?.type === filter.value;
        }
        case "attribute": {
          return filterByAttribute(
            filter.value,
            filter.comparison,
            lorcanitoCard
          );
        }
        case "keyword": {
          return filterByKeyword(filter.value, lorcanitoCard);
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
  value: "self" | "opponent" | string,
  playerId: string,
  card: TableCard,
  owner = ""
): boolean {
  if (value === "opponent") {
    return card.ownerId !== playerId;
  } else if (value === "self") {
    return card.ownerId === playerId;
  } else {
    return value === owner;
  }
}

export function filterByStatus(
  value: "ready" | "exerted" | "dry",
  card: TableCard
): boolean {
  if (value === "ready") {
    return !card.meta?.exerted;
  }

  if (value === "exerted") {
    return !!card.meta?.exerted;
  }

  if (value === "dry") {
    return !card.meta?.playedThisTurn;
  }

  return false;
}

export function filterByAttribute(
  value: "cost" | "name",
  comparison: NumericComparison,
  card?: LorcanitoCard
): boolean {
  if (!card) {
    return false;
  }

  let attribute = card[value];

  if (!attribute) {
    return false;
  }

  if (typeof attribute === "string") {
    attribute = attribute.toLocaleLowerCase();
  }

  if (typeof comparison.value === "string") {
    comparison.value = comparison.value.toLocaleLowerCase();
  }

  const operator = comparison.operator;
  switch (operator) {
    case "eq": {
      return attribute === comparison.value;
    }
    case "gt": {
      return attribute > comparison.value;
    }
    case "gte": {
      return attribute >= comparison.value;
    }
    case "lt": {
      return attribute < comparison.value;
    }
    case "lte": {
      return attribute <= comparison.value;
    }
    default: {
      exhaustiveCheck(operator);
      return false;
    }
  }
}

function filterByKeyword(value: Keywords, card?: LorcanitoCard): boolean {
  if (!card) {
    return false;
  }

  if (value === "shift") {
    return !!card?.abilities?.find(shiftAbilityPredicate);
  } else if (value === "bodyguard") {
    return !!card?.abilities?.find(bodyguardAbilityPredicate);
  }

  return false;
}
