import type { LorcanitoCard } from "@lorcanito/engine/cards/cardTypes";
import type { NumericComparison } from "@lorcanito/engine/filter/numericComparison";
import type { StringComparison } from "@lorcanito/engine/filter/stringComparison";
import type { TargetFilter } from "@lorcanito/engine/filter/targetFilter";

type FilterId = "owner" | "zone" | "status" | "keyword" | "type";

export type Abilities =
  | "singer"
  | "shift"
  | "challenger"
  | "bodyguard"
  | "rush"
  | "reckless"
  | "evasive"
  | "resist"
  | "support"
  | "voiceless"
  | "ward"
  | "protector"
  | "challenge_ready_chars";

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
  { filter: "can", value: "challenge" },
  { filter: "type", value: "character" },
  { filter: "zone", value: "play" },
];

export const singASongFilter: TargetFilter[] = [
  { filter: "owner", value: "self" },
  { filter: "can", value: "sing" },
  { filter: "type", value: "character" },
  { filter: "zone", value: "play" },
];

export const shiftCharFilter = (card?: LorcanitoCard) => {
  const filter: TargetFilter[] = [
    { filter: "owner", value: "self" },
    { filter: "can", value: "shift" },
    { filter: "type", value: "character" },
    { filter: "zone", value: "play" },
    {
      filter: "attribute",
      value: "name",
      comparison: {
        operator: "eq",
        value: card?.name || "",
      },
    },
  ];

  return filter;
};

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
    { filter: "status", value: "ready" },
    { filter: "type", value: "character" },
    { filter: "zone", value: "play" },
    { filter: "status", value: "dry" },
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
