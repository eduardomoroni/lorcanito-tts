import type { CardModel } from "@lorcanito/engine/store/models/CardModel";
import type {
  CardEffectTarget,
  PlayerEffectTarget,
} from "@lorcanito/engine/rules/effects/effectTargets";
import type { Abilities } from "@lorcanito/engine/filter/filters";
import type { Zones } from "@lorcanito/engine/types";
import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";
import { StaticTriggeredAbility } from "@lorcanito/engine/rules/abilities/abilities";

export type PlayerEffects =
  | LoreEffect
  | DrawEffect
  | ScryEffect
  | PlayerRestrictionEffect;

export type CardEffects =
  | RevealEffect
  | RevealAndPlayEffect
  | PlayEffect
  | ReplacementEffect
  | ShuffleEffect
  | AttributeEffect
  | MoveCardEffect
  | HealEffect
  | ExertEffect
  | RestrictionEffect
  | DamageEffect
  | AbilityEffect
  | BanishEffect
  | ProtectionEffect
  | DiscardEffect
  | TargetConditionalEffect;

export type Effect = CardEffects | PlayerEffects;

export type ScryEffectPayload = {
  // amount: number;
  // mode: "top" | "bottom" | "both";
  top?: CardModel[];
  bottom?: CardModel[];
  hand?: CardModel[];
  // TODO: Revisit later
  // these fields should not be parte of the payload, they should come from the effect we're resolving
  shouldRevealTutored?: boolean;
  limits?: {
    top?: number;
    bottom?: number;
    hand?: number;
  };
  tutorFilters?: TargetFilter[];
};

export interface DynamicAmount {
  dynamic: true;
  amount?: number;
  multiplier?: "damage";
  // Uses target card as reference
  target?: { attribute: "strength" | "lore" };
  filters?: TargetFilter[];
}

interface PlayerBaseEffect {
  type: PlayerEffects["type"];
  target: PlayerEffectTarget;
}

interface CardBaseEffect {
  type: CardEffects["type"];
  target: CardEffectTarget;
  amount?: number | DynamicAmount;
}

export interface RestrictionEffect extends CardBaseEffect {
  type: "restriction";
  restriction: "quest" | "challenge" | "exert";
  // TODO: Static effects should not have duration, they're valid as long as the source is in play
  duration: "turn" | "next_turn";
  until?: boolean;
}

export interface PlayerRestrictionEffect extends PlayerBaseEffect {
  type: "player-restriction";
  restriction: "play-action-cards";
}

export interface ProtectionEffect extends CardBaseEffect {
  type: "protection";
  restriction: "challenge";
}

export interface BanishEffect extends CardBaseEffect {
  type: "banish";
}

export interface LoreEffect extends PlayerBaseEffect {
  type: "lore";
  modifier: "add" | "subtract";
  amount: number | DynamicAmount;
}

export interface ReplacementEffect extends CardBaseEffect {
  type: "replacement";
  replacement: "cost";
  duration: "next" | "static";
}

export interface TargetConditionalEffect extends CardBaseEffect {
  type: "conditional";
  effects: Array<Exclude<CardEffects, TargetConditionalEffect>>;
  fallback: Array<Exclude<CardEffects, TargetConditionalEffect>>;
}

export interface ScryEffect extends PlayerBaseEffect {
  type: "scry";
  amount: number | DynamicAmount;
  shouldRevealTutored?: boolean;
  mode: "top" | "bottom" | "both";
  limits?: {
    top?: number;
    bottom?: number;
    hand?: number;
  };
  tutorFilters?: TargetFilter[];
}

export interface ExertEffect extends CardBaseEffect {
  type: "exert";
  exert: boolean;
}

interface ShuffleEffect extends CardBaseEffect {
  type: "shuffle";
}

export interface HealEffect extends CardBaseEffect {
  type: "heal";
  amount: number;
  subEffect?: Effect;
}

export interface DamageEffect extends CardBaseEffect {
  type: "damage";
  amount: number | DynamicAmount;
}
export interface DrawEffect extends PlayerBaseEffect {
  type: "draw";
  amount: number | DynamicAmount;
}
export interface DiscardEffect extends CardBaseEffect {
  type: "discard";
  amount: number | DynamicAmount;
}

export interface PlayEffect extends CardBaseEffect {
  type: "play";
}

export interface RevealEffect extends CardBaseEffect {
  type: "reveal";
}

export interface RevealAndPlayEffect extends CardBaseEffect {
  type: "reveal-and-play";
}

export interface MoveCardEffect extends CardBaseEffect {
  type: "move";
  exerted?: boolean;
  to: Zones;
}

export interface AttributeEffect extends CardBaseEffect {
  type: "attribute";
  attribute: "strength" | "willpower" | "lore";
  amount: number | DynamicAmount;
  modifier: "add" | "subtract";
  duration: "turn" | "next_turn" | "static";
  until?: boolean;
}

export interface AbilityEffect extends CardBaseEffect {
  type: "ability";
  ability: Abilities | "custom";
  customAbility?: StaticTriggeredAbility;
  modifier: "add" | "remove";
  duration: "turn" | "next_turn" | "static";
  // This changes how duration behave.
  // Next turn means that the effect will start at the beginning of the next turn
  // if until is on, it starts immediately and lasts until the end of the next turn
  until?: boolean;
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
    until?: boolean;
  };
  effect: Effect;
}

export const attributeEffectPredicate = (
  effect?: Effect,
): effect is AttributeEffect => effect?.type === "attribute";

export const strengthEffectPredicate = (
  effect?: Effect,
): effect is AttributeEffect =>
  attributeEffectPredicate(effect) && effect.attribute === "strength";

export const loreEffectPredicate = (
  effect?: Effect,
): effect is AttributeEffect =>
  attributeEffectPredicate(effect) && effect.attribute === "lore";

export const conditionEffectPredicate = (
  effect?: Effect,
): effect is TargetConditionalEffect => effect?.type === "conditional";

export const scryEffectPredicate = (effect?: Effect): effect is ScryEffect =>
  effect?.type === "scry";

export const replacementEffectPredicate = (
  effect?: Effect,
): effect is ReplacementEffect => effect?.type === "replacement";

export const costReplacementEffectPredicate = (
  effect?: Effect,
): effect is ReplacementEffect =>
  replacementEffectPredicate(effect) && effect.replacement === "cost";

export const protectionEffectPredicate = (
  effect?: Effect,
): effect is ProtectionEffect => effect?.type === "protection";

export const restrictionEffectPredicate = (
  effect?: Effect,
): effect is RestrictionEffect => effect?.type === "restriction";
