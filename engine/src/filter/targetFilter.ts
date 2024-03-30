import type { NumericComparison } from "@lorcanito/engine/filter/numericComparison";
import type { StringComparison } from "@lorcanito/engine/filter/stringComparison";
import type { Zones } from "@lorcanito/engine/types";
import type { Characteristics } from "@lorcanito/engine/cards/characteristics";
import type { LorcanitoCard } from "@lorcanito/engine/cards/cardTypes";
import type { Abilities } from "@lorcanito/engine/filter/filters";
import { exhaustiveCheck } from "../../../src/libs/exhaustiveCheck";

export type ChallengeFilter = {
  filter: "challenge";
  value: "attacker" | "defender";
};

type TypeFilter = {
  filter: "type";
  value: LorcanitoCard["type"] | Array<LorcanitoCard["type"]>;
};

export type TargetFilter =
  | {
      filter: "turn";
      value: "cardsPlayed";
      targetFilter: [TypeFilter];
      comparison: NumericComparison;
    }
  | { filter: "was-challenged" }
  | { filter: "can"; value: "challenge" | "sing" | "shift" }
  | ChallengeFilter
  | { filter: "source"; value: "self" | "trigger" | "target" }
  | {
      // This is a dynamic filter, that is created and evaluated in runtime
      filter: "instanceId";
      value: string;
    }
  | {
      filter: "top-deck";
      value: "self" | "opponent";
    }
  | {
      filter: "attribute";
      value: "cost" | "strength";
      comparison: NumericComparison;
    }
  | {
      filter: "attribute";
      value: "name" | "title";
      comparison: StringComparison;
    }
  | {
      filter: "owner";
      value: "self" | "opponent" | string;
    }
  | {
      filter: "status";
      value: "ready" | "exerted" | "dry";
    }
  | {
      filter: "status";
      value: "damage";
      comparison: NumericComparison;
    }
  | {
      filter: "zone";
      value: Zones | Array<Zones>;
    }
  | {
      filter: "ability";
      value: Abilities;
    }
  | {
      filter: "characteristics";
      value: Characteristics[];
      conjunction?: "and" | "or";
    }
  | TypeFilter;

export function filterToText(filter: TargetFilter) {
  const activeFilter = filter.filter;

  switch (activeFilter) {
    case "owner": {
      if (filter.value === "self") {
        return "Cards you own";
      }

      if (filter.value === "opponent") {
        return "Cards your opponent owns";
      }

      return `Cards ${filter.value} owns`;
    }
    case "type": {
      return `Type: ${filter.value}`;
    }
    case "status": {
      return `Status: ${filter.value}`;
    }
    case "zone": {
      return `Zone: ${filter.value}`;
    }
    case "attribute": {
      return `Attribute: ${filter.value}`;
    }
    case "characteristics": {
      return `Characteristics: ${filter.value.join(", ")}`;
    }
    case "ability": {
      return `Ability: ${filter.value}`;
    }
    case "source": {
      return `Source: ${filter.value}`;
    }
    case "top-deck": {
      return `Top Deck: ${filter.value}`;
    }
    case "instanceId": {
      return `Instance ID: ${filter.value}`;
    }
    case "challenge": {
      return `Challenge: ${filter.value}`;
    }
    case "can": {
      const { value } = filter;
      switch (value) {
        case "challenge": {
          return "Challenge";
        }
        case "shift": {
          return "Shift";
        }
        case "sing": {
          return "Sing";
        }
        default: {
          exhaustiveCheck(value);
          return "Valid target";
        }
      }
    }
    case "was-challenged": {
      return "Has challenged";
    }
    case "turn": {
      return "has played this turn";
    }
    default: {
      // If this is failing, it means you forgot to add a case for a new filter
      exhaustiveCheck(activeFilter);
      return "Not Found";
    }
  }
}
