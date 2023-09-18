import type { Effect, ExertEffect } from "~/engine/effectTypes";
import type { EffectTargets } from "~/engine/effectTypes";
import { RestrictionEffect } from "~/engine/effectTypes";

export type AbilityTypes =
  | "singer"
  | "shift"
  | "challenger"
  | "bodyguard"
  | "rush"
  | "reckless"
  | "evasive"
  | "support"
  | "ward";

export type Cost =
  | { type: "exert" }
  | { type: "ink"; amount: number }
  | { type: "banish"; target: "self" };

type Condition = {
  type: "hand";
  amount: number;
};

export type Ability =
  | ResolutionAbility
  | ActivatedAbility
  | StaticAbility
  | StaticTriggeredAbility
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
  type?: "static" | "resolution" | "activated" | "static-triggered";
  effects?: Effect[];
  responder?: "self" | "opponent";
  // When undefined, we take name/text from card
  text?: string;
  name?: string;
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
  conditions?: Condition[];
  optional?: boolean;
}

export interface StaticAbility extends BaseAbility {
  ability: AbilityTypes;
  type: "static";
  effect?: never;
}

export type OnTrigger = "quest" | "play" | "banish";
export type Trigger = {
  on: OnTrigger;
  target: EffectTargets;
};

export interface StaticTriggeredAbility extends BaseAbility {
  type: "static-triggered";
  trigger: Trigger;
  optional?: boolean;
  effects?: never;
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
    {
      type: "static-triggered",
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

export const readyAndCantQuest = (target?: EffectTargets) => {
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

export const staticAbilityPredicate = (
  ability?: Ability
): ability is StaticAbility => ability?.type === "static";

export const staticTriggeredAbilityPredicate = (
  ability?: Ability
): ability is StaticTriggeredAbility => ability?.type === "static-triggered";

export const challengerAbilityPredicate = (
  ability?: Ability
): ability is ChallengerAbility =>
  staticAbilityPredicate(ability) && ability.ability === "challenger";
export const recklessAbilityPredicate = (
  ability?: Ability
): ability is RecklessAbility =>
  staticAbilityPredicate(ability) && ability.ability === "reckless";
export const singerAbilityPredicate = (
  ability?: Ability
): ability is SingerAbility =>
  staticAbilityPredicate(ability) && ability.ability === "singer";
export const evasiveAbilityPredicate = (
  ability?: Ability
): ability is EvasiveAbility =>
  staticAbilityPredicate(ability) && ability.ability === "evasive";
export const wardAbilityPredicate = (
  ability?: Ability
): ability is WardAbility =>
  staticAbilityPredicate(ability) && ability.ability === "ward";
export const shiftAbilityPredicate = (
  ability?: Ability | undefined
): ability is ShiftAbility => {
  return staticAbilityPredicate(ability) && ability.ability === "shift";
};
export const bodyguardAbilityPredicate = (
  ability?: Ability
): ability is BodyGuardAbility =>
  staticAbilityPredicate(ability) && ability.ability === "bodyguard";
export const supportAbilityPredicate = (
  ability?: Ability
): ability is SupportAbility =>
  staticAbilityPredicate(ability) && ability.ability === "support";

export const rushAbilityPredicate = (
  ability?: Ability
): ability is SupportAbility =>
  staticAbilityPredicate(ability) && ability.ability === "rush";

export const resolutionAbilityPredicate = (
  ability?: Ability
): ability is ResolutionAbility => ability?.type === "resolution";

export const activatedAbilityPredicate = (
  ability?: Ability
): ability is ActivatedAbility => ability?.type === "activated";

export function notEmptyPredicate<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}
