import type { Zones } from "~/providers/TabletopProvider";
import { Characteristics, LorcanitoCard } from "~/engine/cards/cardTypes";

export type NumericComparison = {
  operator: "gt" | "lt" | "eq" | "gte" | "lte";
  value: number;
};

export type StringComparison = {
  operator: "eq";
  value: string;
};

type FilterId = "owner" | "zone" | "status" | "keyword" | "type";

export type Abilities =
  | "singer"
  | "shift"
  | "challenger"
  | "bodyguard"
  | "rush"
  | "reckless"
  | "evasive"
  | "support"
  | "voiceless"
  | "ward";

export type Keywords =
  | "singer"
  | "shift"
  | "challenger"
  | "bodyguard"
  | "rush"
  | "reckless"
  | "evasive"
  | "support"
  | "voiceless"
  | "ward";

interface BaseStatusFilter {
  filter: "status";
  value: StatusFilterValues;
}
interface ReadyStatusFilter extends BaseStatusFilter {
  value: StatusFilterValues.READY;
}
interface ExertedStatusFilter extends BaseStatusFilter {
  value: StatusFilterValues.EXERTED;
}
interface DryStatusFilter extends BaseStatusFilter {
  value: StatusFilterValues.DRY;
}
interface DamageStatusFilter extends BaseStatusFilter {
  value: StatusFilterValues.DAMAGE;
  comparison: NumericComparison;
}
export type StatusFilter =
  | ReadyStatusFilter
  | ExertedStatusFilter
  | DryStatusFilter
  | DamageStatusFilter;
export enum StatusFilterValues {
  READY = "ready",
  EXERTED = "exerted",
  DRY = "dry",
  DAMAGE = "damage",
}
export type OwnerFilterValue = "self" | "opponent" | string;
export type AttributeFilterValue = "cost" | "name" | "title";

export type TargetFilter =
  | {
      filter: "attribute";
      value: AttributeFilterValue;
      comparison: NumericComparison | StringComparison;
    }
  | {
      filter: "owner";
      value: OwnerFilterValue;
    }
  | StatusFilter
  | {
      filter: "zone";
      value: Zones;
    }
  | {
      filter: "keyword";
      value: Keywords;
    }
  | {
      filter: "ability";
      value: Abilities;
    }
  | {
      filter: "characteristics";
      value: Characteristics[];
    }
  | {
      filter: "type";
      value: LorcanitoCard["type"] | Array<LorcanitoCard["type"]>;
    };

export const filters: Array<{
  id: FilterId;
  name: string;
  options: Array<{
    value: string;
    label: string;
    checked: boolean;
  }>;
}> = [
  {
    id: "owner",
    name: "Card Owner",
    options: [
      { value: "player", label: "Cards you own", checked: false },
      { value: "opponent", label: "Card opponent owns", checked: false },
    ],
  },
  {
    id: "keyword",
    name: "Card Keyword",
    options: [
      { value: "shift", label: "Shift", checked: false },
      { value: "bodyguard", label: "Bodyguard", checked: false },
    ],
  },
  {
    id: "zone",
    name: "Zone",
    options: [
      { value: "play", label: "In play", checked: false },
      { value: "hand", label: "In Hand", checked: false },
      { value: "discard", label: "Discard Pile", checked: false },
    ],
  },
  {
    id: "status",
    name: "Status",
    options: [
      { value: "ready", label: "Ready Glimmer", checked: false },
      { value: "exerted", label: "Exerted Glimmer", checked: false },
    ],
  },
  {
    id: "keyword",
    name: "Keyword",
    options: [
      { value: "shift", label: "Shift", checked: false },
      { value: "bodyguard", label: "Bodyguard", checked: false },
    ],
  },
  {
    id: "type",
    name: "Type",
    options: [
      { value: "item", label: "Item", checked: false },
      { value: "character", label: "Character", checked: false },
      { value: "action", label: "Action", checked: false },
    ],
  },
];

export const challengeOpponentsCardsFilter: TargetFilter[] = [
  { filter: "owner", value: "opponent" },
  { filter: "status", value: StatusFilterValues.EXERTED },
  { filter: "type", value: "character" },
  { filter: "zone", value: "play" },
];

export function canSingFilter(song: LorcanitoCard): TargetFilter[] {
  if (
    !song ||
    song.type !== "action" ||
    !song.cost ||
    !song.characteristics?.includes("song")
  ) {
    return [];
  }

  //TODO: ADD singer ability to filter, this should be an OR filter
  return [
    { filter: "owner", value: "self" },
    { filter: "status", value: StatusFilterValues.READY },
    { filter: "type", value: "character" },
    { filter: "zone", value: "play" },
    { filter: "status", value: StatusFilterValues.DRY },
    {
      filter: "attribute",
      value: "cost",
      comparison: { operator: "gte", value: song.cost },
    },
  ];
}

export function isStringComparison(
  comparison: NumericComparison | StringComparison,
): comparison is StringComparison {
  return typeof comparison.value === "string";
}

export function isNumericComparison(
  comparison: NumericComparison | StringComparison,
): comparison is NumericComparison {
  return typeof comparison.value === "number";
}
