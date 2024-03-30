import type {
  Effect,
  ExertEffect,
  ReplacementEffect,
} from "@lorcanito/engine/rules/effects/effectTypes";

import type {
  AttributeEffect,
  DiscardEffect,
  DrawEffect,
  PlayerRestrictionEffect,
  RestrictionEffect,
} from "@lorcanito/engine/rules/effects/effectTypes";

import type {
  CardEffectTarget,
  EffectTargets,
  PlayerEffectTarget,
} from "@lorcanito/engine/rules/effects/effectTargets";

import type { NumericComparison } from "@lorcanito/engine/filter/numericComparison";
import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";

export type AbilityTypes =
  | "singer"
  | "shift"
  | "resist"
  | "challenger"
  | "reverse-challenger"
  | "bodyguard"
  | "rush"
  | "reckless"
  | "evasive"
  | "support"
  | "voiceless"
  | "ward"
  | "gain-ability"
  | "effects" // I need a better solution for this
  // TODO: Attribute and restriction are really static abilities?
  | "challenge-ready-chars"
  | "restriction"
  | "player-restriction"
  | "protector"
  | "attribute";

export type Cost =
  | { type: "exert" }
  | { type: "exert-characters"; amount: number }
  | { type: "ink"; amount: number }
  | { type: "banish"; target: "self" };

export type Ability =
  | ResolutionAbility
  | ActivatedAbility
  | StaticAbility
  | PropertyStaticAbility
  | WhileStaticAbility
  | StaticTriggeredAbility
  | PlayStaticAbility
  | DelayedTriggeredAbility;

// An ability is a property of an object that influences the game by generating
// effects or by creating a layer on the stack that resolves and generates effects
export interface BaseAbility {
  // Following https://storage.googleapis.com/fabmaster/media/documents/FaB_Comprehensive_Rules_v2.1.0_access.pdf
  // as lorcana doesn't have a rules document
  type?:
    | "static"
    | "while-static"
    | "static-triggered"
    | "property-static"
    | "play-static"
    | "resolution"
    | "activated"
    | "delayed-triggered";
  effects?: Effect[];
  responder?: "self" | "opponent";
  // When undefined, we take name/text from card
  text?: string;
  name?: string;
  conditions?: Condition[];
  costs?: Cost[];
  optional?: boolean;
  // Whether the player has decided to trigger the optional ability
  accepted?: boolean;
  // This is being used to solved sequencial effects like: Draw and then discard a card
  resolveEffectsIndividually?: boolean;
  // Flag to help the UI to better sort result of auto resolve effects.
  detrimental?: boolean;
  // This is being used to solved dependendant effects like: banish a character and then draw a card
  dependentEffects?: boolean;
}

export interface ResolutionAbility extends BaseAbility {
  type: "resolution";
  resolutionConditions?: Condition[];
  name?: string;
  effects: Effect[];
  costs?: Cost[];
  onCancelLayer?: Omit<ResolutionAbility, "onCancelLayer" | "optional">;
}

export interface ActivatedAbility extends BaseAbility {
  type: "activated";
  effects: Effect[];
}

export interface StaticAbility extends BaseAbility {
  type: "static";
  // TODO: Why do we have an ability property here?
  ability: AbilityTypes;
}

export interface PropertyStaticAbility extends BaseAbility {
  type: "property-static";
  ability: "attribute";
  effects: AttributeEffect[];
}

export interface PlayStaticAbility extends BaseAbility {
  type: "play-static";
  conditions: Condition[];
  effects: ReplacementEffect[];
}

export type Condition =
  | { type: "resolution"; value: "bodyguard" | "shift" }
  | { type: "attribute"; attribute: "strength"; comparison: NumericComparison }
  | { type: "damage"; value: number }
  | { type: "filter"; filters: TargetFilter[]; comparison: NumericComparison }
  | {
      type: "play";
      comparison: NumericComparison;
    }
  | {
      type: "hand";
      amount: number | "less_than_opponent";
      player: "self" | "opponent";
    }
  | {
      type: "turn";
      value: "self" | "opponent";
    }
  | { type: "exerted" }
  | { type: "char-is-at-location" }
  | { type: "not-alone" }
  | { type: "played-songs" }
  | {
      type: "inkwell";
      amount: number;
    };

export type WhileCondition = Condition;

// 5.4.7. A while-static ability is a static ability that is functional when its while-condition is met.
export interface WhileStaticAbility extends BaseAbility {
  type: "while-static";
  whileCondition: WhileCondition[];
  ability: StaticAbility | PropertyStaticAbility;
}

export type ChallengeTrigger = {
  on: "challenge";
  as?: "attacker" | "defender";
  filters?: TargetFilter[];
};

export type BanishTrigger = {
  on: "banish";
  in?: "challenge";
  // `trigger.as` triggers when the source of the ability is the attacker or defender
  as?: "attacker" | "defender" | "both";
  exclude?: "source";
  filters?: TargetFilter[];
};

export type QuestTrigger = {
  on: "quest";
  target: CardEffectTarget;
};
export type ReadyTrigger = {
  on: "ready";
  target: CardEffectTarget;
};
export type DiscardTrigger = {
  on: "discard";
  player: "self" | "opponent";
};
export type OnMoveTrigger = {
  on: "play" | "leave";
  target: EffectTargets;
};
type StartTurnTrigger = {
  on: "start_turn";
  target: PlayerEffectTarget;
};
type EndTurnTrigger = {
  on: "end_turn";
  target: EffectTargets;
};

export type DamageTrigger = {
  on: "damage";
  filters: TargetFilter[];
};

export type HealTrigger = {
  on: "heal";
  filters: TargetFilter[];
};

export type BanishAnotherTrigger = {
  on: "banish-another";
};

export type MovesToLocationTrigger = {
  on: "moves-to-a-location";
  target: EffectTargets;
};

export type Trigger =
  | QuestTrigger
  | ReadyTrigger
  | DiscardTrigger
  | DamageTrigger
  | HealTrigger
  | MovesToLocationTrigger
  | StartTurnTrigger
  | EndTurnTrigger
  | OnMoveTrigger
  | BanishAnotherTrigger
  | BanishTrigger
  | ChallengeTrigger;

export interface StaticTriggeredAbility extends BaseAbility {
  type: "static-triggered";
  trigger: Trigger;
  layer: ResolutionAbility;
}

export interface DelayedTriggeredAbility extends BaseAbility {
  type: "delayed-triggered";
  trigger: Trigger;
  // number is only used during serialization
  duration: "turn" | "next_turn" | number;
  layer: ResolutionAbility;
}

export interface SingerAbility extends StaticAbility {
  ability: "singer";
  type: "static";
  value: number;
}

export const singerAbility = (value: number): SingerAbility => {
  return {
    type: "static",
    ability: "singer",
    value: value,
    text: `**Singer** +${value} _(This character counts as cost ${value} to sing songs.)_`,
  } as SingerAbility;
};

export interface ResistAbility extends StaticAbility {
  type: "static";
  ability: "resist";
  value: number;
}

export const resistAbility = (value: number): ResistAbility => {
  return {
    type: "static",
    ability: "resist",
    value: value,
    text: `**Resist** +${value} _(Damage dealt to this character is reduced by ${value}.)_`,
  } as ResistAbility;
};

// TODO: Seems similar to AbilityEffect, perhaps we could combine them
export interface GainAbilityStaticAbility extends StaticAbility {
  type: "static";
  ability: "gain-ability";
  target: CardEffectTarget;
  // TODO: This type is referring itself
  gainedAbility: StaticAbility | ActivatedAbility;
}

export interface EffectStaticAbility extends StaticAbility {
  type: "static";
  ability: "effects";
  effects: Effect[];
}

export interface RestrictionStaticAbility extends StaticAbility {
  type: "static";
  ability: "restriction";
  effect: RestrictionEffect;
  target: CardEffectTarget;
}

export interface PlayerRestrictionStaticAbility extends StaticAbility {
  type: "static";
  ability: "player-restriction";
  effect: PlayerRestrictionEffect;
}

export interface ShiftAbility extends StaticAbility {
  ability: "shift";
  shift: number;
}

export const shiftAbility = (shift: number, name: string): ShiftAbility => {
  return {
    type: "static",
    ability: "shift",
    shift,
    text: `**Shift** ${5} _(You may pay 5 ⬡ to play this on top of one of your characters named ${name}.)_`,
  } as ShiftAbility;
};
export const challengerAbility = (value: number): ChallengerAbility => {
  return {
    type: "static",
    ability: "challenger",
    value: value,
    text: `**Challenger** +${value} (_When challenging, this character get +${value}3 ※._)`,
  };
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

export interface ReverseChallengerAbility extends StaticAbility {
  ability: "reverse-challenger";
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
  type: "static",
  ability: "ward",
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

export const challengeReadyCharacters: StaticAbility = {
  type: "static",
  ability: "challenge-ready-chars",
};

export const protectorAbility: StaticAbility = {
  type: "static",
  ability: "protector",
};

export const whenMovesToALocation = (params: {
  name: string;
  text: string;
  optional?: boolean;
  effects: Effect[];
}): Ability => {
  const { optional, name, text, effects } = params;
  const layer: ResolutionAbility = {
    type: "resolution",
    optional,
    name,
    text,
    effects,
  };

  return {
    type: "static-triggered",
    trigger: {
      on: "moves-to-a-location",
      target: {
        type: "card",
        value: "all",
        filters: [{ filter: "source", value: "self" }],
      },
    },
    name,
    text,
    layer,
  };
};

export const whenPlayAndWhenLeaves = (params: {
  name: string;
  text: string;
  optional?: boolean;
  effects: Effect[];
}): Ability[] => {
  const { optional, name, text, effects } = params;
  const layer: ResolutionAbility = {
    type: "resolution",
    optional,
    name,
    text,
    effects,
  };

  return [
    layer,
    {
      type: "static-triggered",
      name,
      text,
      trigger: {
        on: "leave",
        target: {
          type: "card",
          value: "all",
          filters: [{ filter: "source", value: "self" }],
        },
      },
      layer,
    } as StaticTriggeredAbility,
  ];
};

export const wheneverCharactersIsBanishedInAChallenge = (params: {
  effects: Effect[];
  target?: EffectTargets;
  triggerFilter?: TargetFilter[];
  name?: string;
  text?: string;
  optional?: boolean;
}): StaticTriggeredAbility => {
  const { triggerFilter, optional, effects, name, text } = params;

  const layer: ResolutionAbility = {
    type: "resolution",
    optional,
    name,
    text,
    effects,
  };

  const ability: StaticTriggeredAbility = {
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
    layer,
  };
  return ability;
};

// TODO: What's the difference between this and wheneverCharacterChallengesAndBanishes?
export const wheneverBanishesAnotherCharacterInChallenge = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): StaticTriggeredAbility => {
  const { optional, effects, name, text } = params;
  const layer: ResolutionAbility = {
    type: "resolution",
    optional,
    name,
    text,
    effects,
  };

  return {
    type: "static-triggered",
    name,
    text,
    trigger: {
      on: "banish-another",
    } as BanishAnotherTrigger,
    layer: layer,
  };
};

// TODO: What's the difference between this and wheneverBanishesAnotherCharacterInChallenge?
export const duringYourTurnWheneverBanishesCharacterInChallenge = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
}): StaticTriggeredAbility => {
  const { detrimental, optional, effects, name, text } = params;
  return {
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
      detrimental,
      optional,
      name,
      text,
      effects,
    } as ResolutionAbility,
  };
};

export const wheneverAnotherCharIsBanished = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): StaticTriggeredAbility => {
  const { optional, effects, name, text } = params;
  return {
    type: "static-triggered",
    name,
    text,
    trigger: {
      on: "banish",
      exclude: "source",
      filters: [{ filter: "type", value: "character" }],
    } as BanishTrigger,
    layer: {
      type: "resolution",
      optional,
      name,
      text,
      effects,
    } as ResolutionAbility,
  };
};

export const wheneverYouPlayAFloodBorn = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
  excludeSelf?: boolean;
  responder?: "opponent";
  costs?: Cost[];
}): StaticTriggeredAbility => {
  return wheneverPlays({
    triggerTarget: {
      type: "card",
      value: "all",
      filters: [
        { filter: "owner", value: "self" },
        { filter: "type", value: "character" },
        { filter: "zone", value: "play" },
        { filter: "characteristics", value: ["floodborn"] },
      ],
    },
    ...params,
  });
};

export const whenThisCharacterBanished = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): StaticTriggeredAbility => {
  const { optional, effects, name, text } = params;
  return {
    type: "static-triggered",
    name,
    text,
    trigger: {
      on: "banish",
      filters: [{ filter: "source", value: "self" }],
    } as BanishTrigger,
    layer: {
      type: "resolution",
      optional,
      name,
      text,
      effects,
    } as ResolutionAbility,
  };
};

export const whenBanishedInAChallenge = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): StaticTriggeredAbility => {
  const { optional, effects, name, text } = params;

  return {
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
  };
};

export const whenChallengedAndBanished = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
}): StaticTriggeredAbility => {
  const { optional, effects, name, text } = params;

  return {
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
  };
};

export const wheneverOneOfYourCharChallenges = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  responder?: "self" | "opponent";
}): StaticTriggeredAbility => {
  const { responder, optional, effects, name, text } = params;
  return {
    type: "static-triggered",
    name,
    text,
    trigger: {
      on: "challenge",
      as: "attacker",
      filters: [{ filter: "owner", value: "self" }],
    } as ChallengeTrigger,
    layer: {
      type: "resolution",
      optional,
      responder,
      name,
      text,
      effects,
    } as ResolutionAbility,
  };
};

export const whenChallenged = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  responder?: "self" | "opponent";
}): StaticTriggeredAbility => {
  const { responder, optional, effects, name, text } = params;
  return {
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
  };
};

export const whenPlayAndWheneverQuests = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  resolveEffectsIndividually?: boolean;
  dependentEffects?: boolean;
}): Ability[] => {
  const {
    dependentEffects,
    resolveEffectsIndividually,
    optional,
    effects,
    target,
    name,
    text,
  } = params;
  return [
    {
      type: "resolution",
      optional,
      name,
      text,
      effects,
      resolveEffectsIndividually,
      dependentEffects,
    } as ResolutionAbility,
    wheneverQuests({
      effects,
      name,
      text,
      optional,
      resolveEffectsIndividually,
      dependentEffects,
    }),
  ];
};

export const wheneverQuests = (params: {
  effects: Effect[];
  name?: string;
  text?: string;
  optional?: boolean;
  responder?: "self" | "opponent";
  dependentEffects?: boolean;
  resolveEffectsIndividually?: boolean;
}): StaticTriggeredAbility => {
  const {
    dependentEffects,
    resolveEffectsIndividually,
    optional,
    effects,
    name,
    text,
    responder,
  } = params;

  const layer: ResolutionAbility = {
    type: "resolution",
    optional,
    resolveEffectsIndividually,
    dependentEffects,
    responder,
    name,
    text,
    effects,
  };

  const ability: StaticTriggeredAbility = {
    type: "static-triggered",
    name,
    text,
    trigger: {
      on: "quest",
      target: {
        type: "card",
        value: "all",
        filters: [{ filter: "source", value: "self" }],
      },
    } as QuestTrigger,
    layer,
  };

  return ability;
};

export const whenYouPlayMayDrawACard: ResolutionAbility = {
  type: "resolution",
  optional: true,
  responder: "self",
  text: "When you play this item, you may draw a card.",
  effects: [
    {
      type: "draw",
      amount: 1,
      target: {
        type: "player",
        value: "self",
      },
    } as DrawEffect,
  ],
};

export const wheneverYouHeal = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
  resolveEffectsIndividually?: boolean;
  costs?: Cost[];
}): StaticTriggeredAbility => {
  const {
    resolveEffectsIndividually,
    detrimental,
    costs,
    optional,
    effects,
    name,
    text,
  } = params;
  const layer: ResolutionAbility = {
    type: "resolution",
    name,
    text,
    optional,
    detrimental,
    resolveEffectsIndividually,
    effects,
    costs,
  };
  return {
    type: "static-triggered",
    optional,
    name,
    text,
    trigger: {
      on: "heal",
      filters: [
        { filter: "owner", value: "self" },
        { filter: "zone", value: "play" },
        { filter: "type", value: "character" },
      ],
    } as HealTrigger,
    layer,
  };
};

export const wheneverOppCharIsDamaged = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
  resolveEffectsIndividually?: boolean;
  costs?: Cost[];
}): StaticTriggeredAbility => {
  const {
    resolveEffectsIndividually,
    detrimental,
    costs,
    optional,
    effects,
    name,
    text,
  } = params;
  const layer: ResolutionAbility = {
    type: "resolution",
    name,
    text,
    optional,
    detrimental,
    resolveEffectsIndividually,
    effects,
    costs,
  };
  return {
    type: "static-triggered",
    optional,
    name,
    text,
    trigger: {
      on: "damage",
      filters: [
        { filter: "owner", value: "opponent" },
        { filter: "zone", value: "play" },
        { filter: "type", value: "character" },
      ],
    } as DamageTrigger,
    layer,
  };
};

export const atTheEndOfYourTurnLayer = (params: {
  name?: string;
  text?: string;
  optional?: boolean;
  layer: ResolutionAbility;
  conditions?: Condition[];
  target: EffectTargets;
}): StaticTriggeredAbility => {
  const { target, conditions, optional, name, text, layer } = params;

  if (name) {
    layer.name = name;
  }

  if (text) {
    layer.text = text;
  }

  return {
    type: "static-triggered",
    conditions,
    optional,
    name,
    text,
    trigger: {
      on: "end_turn",
      target,
    } as EndTurnTrigger,
    layer,
  };
};

export const atTheStartOfYourTurnLayer = (params: {
  name?: string;
  text?: string;
  optional?: boolean;
  layer: ResolutionAbility;
  conditions?: Condition[];
}): StaticTriggeredAbility => {
  const { conditions, optional, name, text, layer } = params;

  if (name) {
    layer.name = name;
  }

  if (text) {
    layer.text = text;
  }

  return {
    type: "static-triggered",
    conditions,
    optional,
    name,
    text,
    trigger: {
      on: "start_turn",
      target: {
        type: "player",
        value: "self",
      },
    } as StartTurnTrigger,
    layer,
  };
};

export const atTheEndOfYourTurn = (params: {
  effects: Effect[];
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
  resolveEffectsIndividually?: boolean;
  costs?: Cost[];
  conditions?: Condition[];
  target: EffectTargets;
}): StaticTriggeredAbility => {
  const {
    resolveEffectsIndividually,
    detrimental,
    costs,
    optional,
    effects,
    name,
    text,
    conditions,
    target,
  } = params;

  const layer: ResolutionAbility = {
    type: "resolution",
    name,
    text,
    optional,
    detrimental,
    resolveEffectsIndividually,
    effects,
    costs,
  };

  return atTheEndOfYourTurnLayer({
    target,
    optional,
    name,
    text,
    layer,
    conditions,
  });
};

export const atTheStartOfYourTurn = (params: {
  effects: Effect[];
  target?: EffectTargets;
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
  resolveEffectsIndividually?: boolean;
  costs?: Cost[];
  conditions?: Condition[];
}): StaticTriggeredAbility => {
  const {
    resolveEffectsIndividually,
    detrimental,
    costs,
    optional,
    effects,
    name,
    text,
    conditions,
  } = params;

  const layer: ResolutionAbility = {
    type: "resolution",
    name,
    text,
    optional,
    detrimental,
    resolveEffectsIndividually,
    effects,
    costs,
  };

  return atTheStartOfYourTurnLayer({ optional, name, text, layer, conditions });
};

export const wheneverYouPlay = (params: {
  effects: Effect[];
  target?: EffectTargets;
  triggerFilter?: TargetFilter[];
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
  excludeSelf?: boolean;
  costs?: Cost[];
  responder?: "opponent";
}): StaticTriggeredAbility => {
  const {
    excludeSelf,
    detrimental,
    costs,
    triggerFilter,
    optional,
    effects,
    name,
    text,
    responder,
  } = params;
  const layer: ResolutionAbility = {
    type: "resolution",
    responder,
    name,
    text,
    optional,
    detrimental,
    effects,
    costs,
  };
  return {
    type: "static-triggered",
    optional,
    name,
    text,
    trigger: {
      on: "play",
      target: {
        type: "card",
        excludeSelf,
        filters: triggerFilter,
      },
    } as Trigger,
    layer,
  };
};

export const wheneverPlays = (params: {
  triggerTarget: CardEffectTarget;
  effects: Effect[];
  name?: string;
  text?: string;
  optional?: boolean;
  detrimental?: boolean;
  costs?: Cost[];
  responder?: "opponent";
}): StaticTriggeredAbility => {
  const { triggerTarget } = params;
  return wheneverYouPlay({
    ...params,
    triggerFilter: "filters" in triggerTarget ? triggerTarget.filters : [],
  });
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

export const duringYourTurnGains = (
  name: string,
  text: string,
  ability: StaticAbility,
) => {
  return {
    type: "while-static",
    name: name,
    text: text,
    whileCondition: [
      {
        type: "turn",
        value: "self",
      },
    ] as WhileCondition[],
    ability: ability,
  } as WhileStaticAbility;
};

export const drawThenChooseAndDiscard: ResolutionAbility = {
  type: "resolution",
  optional: true,
  resolveEffectsIndividually: true,
  effects: [
    {
      type: "draw",
      amount: 1,
      target: {
        type: "player",
        value: "self",
      },
    } as DrawEffect,
    {
      type: "discard",
      amount: 1,
      target: {
        type: "card",
        value: 1,
        filters: [
          { filter: "owner", value: "self" },
          { filter: "zone", value: "hand" },
        ],
      } as CardEffectTarget,
    } as DiscardEffect,
  ],
};

export const self: PlayerEffectTarget = {
  type: "player",
  value: "self",
};

export const drawACard: DrawEffect = {
  type: "draw",
  amount: 1,
  target: self,
};

export const oneCardFromHand: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "owner", value: "self" },
    { filter: "zone", value: "hand" },
  ],
};

export const chosenCharacter: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "type", value: "character" },
    { filter: "zone", value: "play" },
  ],
};

export const chosenOpposingCharacter: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "type", value: "character" },
    { filter: "zone", value: "play" },
    { filter: "owner", value: "opponent" },
  ],
};

export const anotherChosenCharacter = {
  type: "card",
  value: 1,
  excludeSelf: true,
  filters: chosenCharacter.filters,
};

export const itemsYouControl: TargetFilter[] = [
  { filter: "type", value: "item" },
  { filter: "zone", value: "play" },
  { filter: "owner", value: "self" },
];

export const anotherChosenCharOfYours: CardEffectTarget = {
  type: "card",
  value: 1,
  excludeSelf: true,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "owner", value: "self" },
  ],
};

export const chosenItem: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "item" },
  ],
};

export const chosenItemOfYours: CardEffectTarget = {
  type: "card",
  value: 1,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "item" },
    { filter: "owner", value: "self" },
  ],
};

export const yourOtherCharacters: CardEffectTarget = {
  type: "card",
  value: "all",
  excludeSelf: true,
  filters: [
    { filter: "zone", value: "play" },
    { filter: "type", value: "character" },
    { filter: "owner", value: "self" },
  ],
};
