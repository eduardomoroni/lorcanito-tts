import type { CardModel } from "~/store/models/CardModel";
import { Zones } from "~/providers/TabletopProvider";
import { Keywords, TargetFilter } from "~/components/modals/target/filters";

export type Effect =
  | ReplacementEffect
  // Discrete effects
  | ShuffleEffect
  | AttributeEffect
  | MoveCardEffect
  | HealEffect
  | ScryEffect
  | ExertEffect
  | RestrictionEffect
  | DamageEffect
  | AbilityEffect
  | DrawEffect
  | BanishEffect
  | DiscardEffect
  | ConditionalEffect;

export type CardEffectTarget = {
  type: "card";
  value?: "all" | number;
  filters: TargetFilter[];
};

export type PlayerEffectTarget = {
  type: "player";
  autoResolve?: false;
  value: "self" | "opponent" | "all";
};

export type IdEffectTarget = { type: "instanceId"; instanceId: string };
export type EffectTargets =
  | CardEffectTarget
  | PlayerEffectTarget
  | IdEffectTarget;

export type ScryEffectPayload = {
  top?: CardModel[];
  bottom?: CardModel[];
  hand?: CardModel[];
};

interface BaseEffect {
  type:
    | "shuffle"
    | "heal"
    | "damage"
    | "draw"
    | "discard"
    | "conditional"
    | "restriction"
    | "ability"
    | "replacement"
    | "banish"
    | "scry"
    | "exert"
    | "move"
    | "attribute";
  target?: EffectTargets;
  autoResolve?: boolean;
}

export interface RestrictionEffect extends BaseEffect {
  type: "restriction";
  restriction: "quest" | "challenge";
  duration: "turn" | "next_turn";
}

export interface BanishEffect extends BaseEffect {
  type: "banish";
}

export interface ReplacementEffect extends BaseEffect {
  type: "replacement";
  replacement: "cost";
  duration: "next";
  amount: number;
  target?: never;
  filters: TargetFilter[];
}

export interface ConditionalEffect extends BaseEffect {
  type: "conditional";
  effects: Array<Exclude<Effect, ConditionalEffect>>;
  fallback?: Array<Exclude<Effect, ConditionalEffect>>;
}

export interface ScryEffect extends BaseEffect {
  type: "scry";
  amount: number;
  mode: "top" | "bottom" | "both";
  limits?: {
    top?: number;
    bottom?: number;
  };
  tutorFilters?: TargetFilter[];
}

export interface ExertEffect extends BaseEffect {
  type: "exert";
  exert: boolean;
}

interface ShuffleEffect extends BaseEffect {
  type: "shuffle";
}

export interface HealEffect extends BaseEffect {
  type: "heal";
  amount: number;
}

export interface DamageEffect extends BaseEffect {
  type: "damage";
  amount: number;
}
export interface DrawEffect extends BaseEffect {
  type: "draw" | "discard";
  amount: number;
}
interface DiscardEffect extends BaseEffect {
  type: "discard";
}
export interface MoveCardEffect extends BaseEffect {
  type: "move";
  to: Zones;
}

export interface AttributeEffect extends BaseEffect {
  type: "attribute";
  attribute: "strength" | "willpower" | "lore";
  amount: number;
  modifier: "add" | "subtract";
  duration: "turn" | "next_turn";
}

export interface AbilityEffect extends BaseEffect {
  type: "ability";
  ability: Keywords;
  modifier: "add" | "remove";
  duration: "turn" | "next_turn";
}

export interface ContinuousEffect {
  type: "continuous";
  id: string;
  // TODO: Source should not be optional
  source?: string;
  target?: string;
  filters?: TargetFilter[];
  duration?: {
    // effect last until turn X
    turn: number;
    times?: number;
  };
  effect: Effect;
}

export const attributeEffectPredicate = (
  effect?: Effect
): effect is AttributeEffect => effect?.type === "attribute";

export const strengthEffectPredicate = (
  effect?: Effect
): effect is AttributeEffect =>
  attributeEffectPredicate(effect) && effect.attribute === "strength";

export const loreEffectPredicate = (
  effect?: Effect
): effect is AttributeEffect =>
  attributeEffectPredicate(effect) && effect.attribute === "lore";

export const conditionEffectPredicate = (
  effect?: Effect
): effect is ConditionalEffect => effect?.type === "conditional";

export const scryEffectPredicate = (effect?: Effect): effect is ScryEffect =>
  effect?.type === "scry";

export const replacementEffectPredicate = (
  effect?: Effect
): effect is ReplacementEffect => effect?.type === "replacement";

export const cardEffectTargetPredicate = (
  target?: EffectTargets
): target is CardEffectTarget => target?.type === "card";

export const playerEffectTargetPredicate = (
  target?: EffectTargets
): target is PlayerEffectTarget => target?.type === "player";
