import type { Effect, ExertEffect } from "~/engine/rules/effects/effectTypes";
import type { EffectTargets } from "~/engine/rules/effects/effectTypes";
import {
  HealEffect,
  RestrictionEffect,
} from "~/engine/rules/effects/effectTypes";
import { TargetFilter } from "~/components/modals/target/filters";

export type AbilityTypes =
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

export type Cost =
  | { type: "exert" }
  | { type: "ink"; amount: number }
  | { type: "banish"; target: "self" };

export type Condition = {
  type: "hand";
  amount: number | "less_than_opponent";
};

export type Ability =
  | ResolutionAbility
  | ActivatedAbility
  | StaticAbility
  | WhileStaticAbility
  | StaticTriggeredAbility
  | DelayedTriggeredAbility
  // TODO: This can only be fixed once we implement all abilities
  | {
      text?: string;
      ability?: string;
      type?: "static" | "resolution" | "activated";
      name?: string;
    };

// An ability is a property of an object that influences the game by generating
// effects or by creating a layer on the stack that resolves and generates effects
export interface BaseAbility {
  // Following https://storage.googleapis.com/fabmaster/media/documents/FaB_Comprehensive_Rules_v2.1.0_access.pdf
  // as lorcana doesn't have a rules document
  type?:
    | "static"
    | "while-static"
    | "resolution"
    | "activated"
    | "static-triggered"
    | "delayed-triggered";
  effects?: Effect[];
  responder?: "self" | "opponent";
  // When undefined, we take name/text from card
  text?: string;
  name?: string;
  conditions?: Condition[];
  costs?: Cost[];
}

export interface ResolutionAbility extends BaseAbility {
  type: "resolution";
  name?: string;
  effects: Effect[];
  // targets?: EffectTargets;
  optional?: boolean;
  costs?: Cost[];
}

export interface ActivatedAbility extends BaseAbility {
  type: "activated";
  effects: Effect[];
  optional?: boolean;
}

export interface StaticAbility extends BaseAbility {
  ability: AbilityTypes;
  type: "static";
  effect?: never;
}

export type WhileCondition = {
  type: "turn";
  value: "self" | "opponent";
};

// 5.4.7. A while-static ability is a static ability that is functional when its while-condition is met.
export interface WhileStaticAbility extends BaseAbility {
  type: "while-static";
  whileCondition: WhileCondition;
  ability: StaticAbility;
}

export type ChallengeTrigger = {
  on: "challenge";
  as?: "attacker" | "defender";
};

export type BanishTrigger = {
  on: "banish";
  in?: "challenge";
  // `trigger.as` triggers when the source of the ability is the attacker or defender
  as?: "attacker" | "defender" | "both";
  exclude?: "source";
  filters?: TargetFilter[];
};

export type BanishAnotherTrigger = {
  on: "banish-another";
};

export type OnTrigger =
  | "quest"
  | "play"
  | "banish"
  | "challenge"
  | "banish-another";

export type Trigger =
  | {
      on: "quest";
    }
  | {
      on: "play";
      target: EffectTargets;
    }
  | BanishAnotherTrigger
  | BanishTrigger
  | ChallengeTrigger;

export interface StaticTriggeredAbility extends BaseAbility {
  type: "static-triggered";
  trigger: Trigger;
  optional?: boolean;
  effects?: never;
  layer: ResolutionAbility;
}

export interface DelayedTriggeredAbility extends BaseAbility {
  type: "delayed-triggered";
  trigger: Trigger;
  optional?: boolean;
  effects?: never;
  // number is only used during serialization
  duration: "turn" | "next_turn" | number;
  layer: ResolutionAbility;
}

export interface SingerAbility extends StaticAbility {
  ability: "singer";
  type: "static";
  value: number;
}

export interface ShiftAbility extends StaticAbility {
  ability: "shift";
  shift: number;
}

export const shiftAbility = (shift: number, name: string): ShiftAbility => {
  return {
    type: "static",
    shift,
    ability: "shift",
    text: `**Shift** ${5} _(You may pay 5 ⬡ to play this on top of one of your characters named ${name}.)_`,
  } as ShiftAbility;
};

export interface VoicelessAbility extends StaticAbility {
  ability: "voiceless";
  type: "static";
}

export const voicelessAbility: VoicelessAbility = {
  ability: "voiceless",
  type: "static",
  text: "This character can't ↷ to sing songs.",
};

export interface ChallengerAbility extends StaticAbility {
  ability: "challenger";
  value: number;
}

export interface RushAbility extends StaticAbility {
  ability: "rush";
  type: "static";
}

export const rushAbility: RushAbility = {
  ability: "rush",
  type: "static",
  text: "_(This character can challenge the turn they're played.)_",
};

export interface RecklessAbility extends StaticAbility {
  ability: "reckless";
  type: "static";
}

export const recklessAbility: RecklessAbility = {
  ability: "reckless",
  type: "static",
  text: "_(This character can't quest and must challenge each turn if able.)_",
};

export interface EvasiveAbility extends StaticAbility {
  ability: "evasive";
  type: "static";
}

export const evasiveAbility: EvasiveAbility = {
  ability: "evasive",
  type: "static",
  text: "_(Only characters with Evasive can challenge this character.)_",
};

// TODO: I am not sure this is static ability
export interface SupportAbility extends StaticAbility {
  ability: "support";
  type: "static";
}

export const supportAbility: SupportAbility = {
  ability: "support",
  type: "static",
  text: "_(Whenever this character quests, you may add their ※ to another chosen character‘s ※ this turn.)_",
};

export interface WardAbility extends StaticAbility {
  ability: "ward";
  type: "static";
}

export const wardAbility: WardAbility = {
  ability: "ward",
  type: "static",
  text: "_(Opponents can't choose this character except to challenge.)_",
};

export interface BodyGuardAbility extends StaticAbility {
  ability: "bodyguard";
  type: "static";
}

export const bodyguardAbility: BodyGuardAbility = {
  ability: "bodyguard",
  type: "static",
  text: "**Bodyguard** _(This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.)_",
};

export const wheneverCharactersIsBanishedInAChallenge = (params: {
  effects: Effect[];
  target?: EffectTargets;
  triggerFilter?: TargetFilter[];
  name?: string;
  text?: string;
  optional?: boolean;
}): Ability[] => {
  const { triggerFilter, optional, effects, name, text } = params;
  return [
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "banish",
        in: "challenge",
        as: "both",
        exclude: "source",
        filters: triggerFilter,
      } as BanishTrigger,
      layer: {
        type: "resolution",
        optional,
        name,
        text,
        effects,
      } as ResolutionAbility,
    } as StaticTriggeredAbility,
  ];
};

export const wheneverBanishesAnotherCharacterInChallenge = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): Ability[] => {
  const { optional, effects, name, text } = params;
  return [
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "banish-another",
      } as BanishAnotherTrigger,
      layer: {
        type: "resolution",
        optional,
        name,
        text,
        effects,
      } as ResolutionAbility,
    } as StaticTriggeredAbility,
  ];
};

export const wheneverCharacterChallengesAndBanishes = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): Ability[] => {
  const { optional, effects, name, text } = params;
  return [
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "banish",
        in: "challenge",
        as: "attacker",
      } as BanishTrigger,
      layer: {
        type: "resolution",
        optional,
        name,
        text,
        effects,
      } as ResolutionAbility,
    } as StaticTriggeredAbility,
  ];
};

export const whenBanishedInAChallenge = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): Ability[] => {
  const { optional, effects, name, text } = params;
  return [
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "banish",
        in: "challenge",
        as: "both",
      } as BanishTrigger,
      layer: {
        type: "resolution",
        optional,
        name,
        text,
        effects,
      } as ResolutionAbility,
    } as StaticTriggeredAbility,
  ];
};

export const whenChallengedAndBanished = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): Ability[] => {
  const { optional, effects, name, text } = params;
  return [
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "banish",
        in: "challenge",
        as: "defender",
      } as BanishTrigger,
      layer: {
        type: "resolution",
        optional,
        name,
        text,
        effects,
      } as ResolutionAbility,
    } as StaticTriggeredAbility,
  ];
};

export const whenChallenged = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  responder?: "self" | "opponent";
}): Ability[] => {
  const { responder, optional, effects, name, text } = params;
  return [
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "challenge",
        as: "defender",
      } as ChallengeTrigger,
      layer: {
        type: "resolution",
        optional,
        responder,
        name,
        text,
        effects,
      } as ResolutionAbility,
    } as StaticTriggeredAbility,
  ];
};

export const whenPlayAndWheneverQuests = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): Ability[] => {
  const { optional, effects, target, name, text } = params;
  return [
    {
      type: "resolution",
      optional,
      name,
      text,
      effects,
    } as ResolutionAbility,
    ...wheneverQuests({ effects, name, text, optional }),
  ];
};

export const wheneverQuests = (params: {
  effects: Effect[];
  name?: string;
  text?: string;
  optional?: boolean;
}): Ability[] => {
  const { optional, effects, name, text } = params;
  return [
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "quest",
      },
      layer: {
        type: "resolution",
        optional,
        name,
        text,
        effects,
      } as ResolutionAbility,
    } as StaticTriggeredAbility,
  ];
};

export const wheneverYouPlay = (params: {
  effects: Effect[];
  target?: EffectTargets;
  triggerFilter?: TargetFilter[];
  name?: string;
  text?: string;
  optional?: boolean;
  costs?: Cost[];
}): StaticTriggeredAbility => {
  const { costs, triggerFilter, optional, effects, name, text } = params;
  return {
    type: "static-triggered",
    optional,
    name,
    text,
    trigger: {
      on: "play",
      target: {
        type: "card",
        filters: triggerFilter,
      },
    } as Trigger,
    layer: {
      type: "resolution",
      name,
      text,
      optional,
      effects,
      costs,
    } as ResolutionAbility,
  };
};

export const wheneverPlays = (params: {
  triggerTarget: EffectTargets;
  effects: Effect[];
  name?: string;
  text?: string;
  optional?: boolean;
  costs?: Cost[];
}): Ability[] => {
  const { costs, optional, effects, name, text, triggerTarget } = params;
  return [
    wheneverYouPlay({
      ...params,
      triggerFilter: "filters" in triggerTarget ? triggerTarget.filters : [],
    }) as StaticTriggeredAbility,
  ];
};

export const readyAndCantQuest = (
  target?: EffectTargets,
): [ExertEffect, RestrictionEffect] => {
  return [
    {
      type: "exert",
      exert: false,
      target,
    } as ExertEffect,
    {
      type: "restriction",
      restriction: "quest",
      duration: "turn",
      target,
    } as RestrictionEffect,
  ];
};

export const exertAndCantReady = (
  target?: EffectTargets,
): [ExertEffect, RestrictionEffect] => {
  return [
    {
      type: "exert",
      exert: true,
      target,
    } as ExertEffect,
    {
      type: "restriction",
      restriction: "exert",
      duration: "next_turn",
      target,
    } as RestrictionEffect,
  ];
};

export const whileStaticAbilityPredicate = (
  ability?: Ability,
): ability is WhileStaticAbility => ability?.type === "while-static";

export const staticAbilityPredicate = (
  ability?: Ability,
): ability is StaticAbility => ability?.type === "static";

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

export const rushAbilityPredicate = (
  ability?: Ability,
): ability is SupportAbility =>
  staticAbilityPredicate(ability) && ability.ability === "rush";

export const resolutionAbilityPredicate = (
  ability?: Ability,
): ability is ResolutionAbility => ability?.type === "resolution";

export const activatedAbilityPredicate = (
  ability?: Ability,
): ability is ActivatedAbility => ability?.type === "activated";

export function notEmptyPredicate<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}
