import type {
  TargetFilter,
  ChallengeFilter,
} from "@lorcanito/engine/filter/targetFilter";

export type CardEffectTarget = {
  type: "card";
  // TODO: instead of all I should make it optional and default to all
  // TODO: Probably should remove it completely
  value: "all" | number;
  // this is meant to simulate `your other characters` by removing the source card from the list
  excludeSelf?: boolean;
  upTo?: boolean;
  filters: TargetFilter[];
};

export type PlayerEffectTarget = {
  type: "player";
  value: "self" | "opponent" | "all" | "target_owner";
};

export type EffectTargets = CardEffectTarget | PlayerEffectTarget;

export const cardEffectTargetPredicate = (
  target?: EffectTargets,
): target is CardEffectTarget => target?.type === "card";

export const playerEffectTargetPredicate = (
  target?: EffectTargets,
): target is PlayerEffectTarget => target?.type === "player";

export const challengeFilterPredicate = (
  filter?: TargetFilter,
): filter is ChallengeFilter => filter?.filter === "challenge";
