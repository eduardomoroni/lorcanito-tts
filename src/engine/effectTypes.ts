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

export type EffectTargets =
  | {
      type: "card";
      value?: "all" | number;
      filters: TargetFilter[];
    }
  | {
      type: "player";
      value: "self" | "opponent" | "all";
    }
  // TODO: this is wrong, we're using this type to type card JSON
  | { type: "cardModel"; card: CardModel };

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
  target: EffectTargets;
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
  filters: TargetFilter[];
}

export interface ConditionalEffect extends BaseEffect {
  type: "conditional";
  effects: Array<{
    effect: Exclude<Effect, ConditionalEffect>;
    target: TargetFilter[];
  }>;
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

interface DamageEffect extends BaseEffect {
  type: "damage";
  amount: number;
}
export interface DrawEffect extends BaseEffect {
  type: "draw";
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

export const scryEffectPredicate = (effect?: Effect): effect is ScryEffect =>
  effect?.type === "scry";
