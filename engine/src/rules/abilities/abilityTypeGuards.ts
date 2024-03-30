import { Effect } from "@lorcanito/engine/rules/effects/effectTypes";
import {
  Ability,
  ActivatedAbility,
  BodyGuardAbility,
  ChallengerAbility,
  DelayedTriggeredAbility,
  EffectStaticAbility,
  EvasiveAbility,
  GainAbilityStaticAbility,
  PlayerRestrictionStaticAbility,
  PlayStaticAbility,
  PropertyStaticAbility,
  RecklessAbility,
  ResistAbility,
  ResolutionAbility,
  RestrictionStaticAbility,
  ReverseChallengerAbility,
  RushAbility,
  ShiftAbility,
  SingerAbility,
  StaticAbility,
  StaticTriggeredAbility,
  SupportAbility,
  VoicelessAbility,
  WardAbility,
  WhileStaticAbility,
} from "@lorcanito/engine/rules/abilities/abilities";

export const whileStaticAbilityPredicate = (
  ability?: Ability,
): ability is WhileStaticAbility => ability?.type === "while-static";
export const staticEffectAbilityPredicate = (
  ability?: Ability,
): ability is EffectStaticAbility =>
  ability?.type === "static" && ability.ability === "effects";
export const gainStaticAbilityPredicate = (
  ability?: Ability,
): ability is GainAbilityStaticAbility =>
  ability?.type === "static" && ability.ability === "gain-ability";

export const whileStaticRestrictionAbilityPredicate = (
  ability?: Ability,
): ability is WhileStaticAbility & { ability: RestrictionStaticAbility } =>
  ability?.type === "while-static" && ability.ability.ability === "restriction";
export const restrictionStaticAbilityPredicate = (
  ability?: Ability,
): ability is RestrictionStaticAbility =>
  staticAbilityPredicate(ability) && ability?.ability === "restriction";
export const playerRestrictionPredicate = (
  ability?: Ability,
): ability is PlayerRestrictionStaticAbility =>
  ability?.type === "static" && ability.ability === "player-restriction";
// TODO: I should probably get rid of this type of effect, it just complicate things
export const singleEffectAbility = (
  ability?: Ability,
): ability is Ability & { effect: Effect } => "effect" in (ability || {});
export const propertyStaticRestrictionAbilityPredicate = (
  ability?: Ability,
): ability is PropertyStaticAbility & { ability: RestrictionStaticAbility } =>
  ability?.type === "property-static" && ability.ability === "attribute";
export const propertyStaticPredicate = (
  ability?: Ability,
): ability is PropertyStaticAbility => ability?.type === "property-static";
export const staticAbilityPredicate = (
  ability?: Ability,
): ability is StaticAbility => ability?.type === "static";
export const singerStaticAbilityPredicate = (
  ability?: Ability,
): ability is SingerAbility =>
  ability?.type === "static" && ability.ability === "singer";
export const staticTriggeredAbilityPredicate = (
  ability?: Ability,
): ability is StaticTriggeredAbility => ability?.type === "static-triggered";
export const delayedTriggeredAbilityPredicate = (
  ability?: Ability,
): ability is DelayedTriggeredAbility => ability?.type === "delayed-triggered";
export const challengerAbilityPredicate = (
  ability?: Ability,
): ability is ChallengerAbility =>
  staticAbilityPredicate(ability) && ability.ability === "challenger";
export const reverseChallengerAbilityPredicate = (
  ability?: Ability,
): ability is ReverseChallengerAbility =>
  staticAbilityPredicate(ability) && ability.ability === "reverse-challenger";
export const recklessAbilityPredicate = (
  ability?: Ability,
): ability is RecklessAbility =>
  staticAbilityPredicate(ability) && ability.ability === "reckless";
export const singerAbilityPredicate = (
  ability?: Ability,
): ability is SingerAbility =>
  staticAbilityPredicate(ability) && ability.ability === "singer";
export const voicelessAbilityPredicate = (
  ability?: Ability,
): ability is VoicelessAbility =>
  staticAbilityPredicate(ability) && ability.ability === "voiceless";
export const evasiveAbilityPredicate = (
  ability?: Ability,
): ability is EvasiveAbility =>
  staticAbilityPredicate(ability) && ability.ability === "evasive";
export const wardAbilityPredicate = (
  ability?: Ability,
): ability is WardAbility =>
  staticAbilityPredicate(ability) && ability.ability === "ward";
export const shiftAbilityPredicate = (
  ability?: Ability | undefined,
): ability is ShiftAbility => {
  return staticAbilityPredicate(ability) && ability.ability === "shift";
};
export const bodyguardAbilityPredicate = (
  ability?: Ability,
): ability is BodyGuardAbility =>
  staticAbilityPredicate(ability) && ability.ability === "bodyguard";
export const supportAbilityPredicate = (
  ability?: Ability,
): ability is SupportAbility =>
  staticAbilityPredicate(ability) && ability.ability === "support";
export const resistAbilityPredicate = (
  ability?: Ability,
): ability is ResistAbility =>
  staticAbilityPredicate(ability) && ability.ability === "resist";
export const protectorAbilityPredicate = (
  ability?: Ability,
): ability is StaticAbility & { ability: "protector" } =>
  staticAbilityPredicate(ability) && ability.ability === "protector";
export const rushAbilityPredicate = (
  ability?: Ability,
): ability is RushAbility =>
  staticAbilityPredicate(ability) && ability.ability === "rush";
export const resolutionAbilityPredicate = (
  ability?: Ability,
): ability is ResolutionAbility => ability?.type === "resolution";
export const activatedAbilityPredicate = (
  ability?: Ability,
): ability is ActivatedAbility => ability?.type === "activated";
export const playStaticAbilityPredicate = (
  ability?: Ability,
): ability is PlayStaticAbility => ability?.type === "play-static";

export function notEmptyPredicate<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}
