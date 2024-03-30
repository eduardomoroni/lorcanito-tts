import type {
  Ability,
  ResolutionAbility,
} from "@lorcanito/engine/rules/abilities/abilities";
import { GameEffect, ResolvingParam, Zones } from "@lorcanito/engine/types";

export type InternalLogEntry = {
  id: string;
  sender?: string;
  instanceId?: string;
  private?: {
    [playerId: string]: {
      instanceId: string;
    };
  };
} & LogEntry;

export type LogEntry =
  | LogEntryTap
  | NewGameEntry
  | WonDieRollEntry
  | AddInkWellEntry
  | ResolvingAbilitiesEntry
  | ScryEntry
  | ShiftEntry
  | GoingFirst
  | ShuffleCardIntoDeckEntry
  | TurnEntry
  | ChallengeEntry
  | ReadyEntry
  | ManualModeEntry
  | PassTurnEntry
  | EffectEntry
  | ResolveEffectEntry
  | InvalidResolutionTarget
  | CancelEffectEntry
  | OptionalLayerAdded
  | OptionalLayerAccepted
  | SkipEffectEntry
  | DiscardEntry
  | ConditionNotMetEntry
  | CantPayCostEntry
  | SingEntry
  | SetEntry
  | DrawEntry
  | RevealCardEntry
  | BackToLobbyEntry
  | GameRestartedEntry
  | LobbyCreated
  | PlayerLeft
  | PlayerJoined
  | PlayerReady
  | LogEntryDamageChange
  | LogEntryLoadDeck
  | LogEntryShuffleDeck
  | LogEntryLoreChange
  | GainLocationLore
  | EnterLocationEntry
  | ReadyToStartGameEntry
  | LookingAtTopCardsEntry
  | LogEntryMoveCard
  | MulliganEntry
  | AutoOptionalEngaged
  | AutoTargetEngaged
  | UndoTurnEntry
  | TutoringCardEntry
  | TutoredCardEntry
  | LogEntryQuest;

interface LogEntryBase {
  type:
    | "TAP"
    | "DAMAGE_CHANGE"
    | "GAME_RESTARTED"
    | "SHUFFLE_CARD"
    | "SING"
    | "LOBBY_CREATED"
    | "MOVE_CARD"
    | "REVEAL_CARD"
    | "BACK_TO_LOBBY"
    | "INVALID_TARGET_RESOLUTION"
    | "QUEST"
    | "WON_DIE_ROLL"
    | "CANCEL_EFFECT"
    | "SKIP_EFFECT"
    | "RESOLVE_LAYER"
    | "EFFECT"
    | "CONDITION_NOT_MET"
    | "CANT_PAY_COSTS"
    | "MULLIGAN"
    | "SCRY"
    | "ADD_TO_INKWELL"
    | "READY_TO_START"
    | "NEW_GAME"
    | "LORE_CHANGE"
    | "SHIFT"
    | "PASS_TURN"
    | "NEW_TURN"
    | "GOING_FIRST"
    | "LOAD_DECK"
    | "READY"
    | "PLAYER_LEFT"
    | "PLAYER_JOINED"
    | "PLAYER_READY"
    | "SET"
    | "CHALLENGE"
    | "RESOLVING_ABILITIES"
    | "OPTIONAL_ABILITY_ON_STACK_ACCEPTED"
    | "OPTIONAL_ABILITY_ON_STACK_ADDED"
    | "DRAW"
    | "DISCARD"
    | "TUTORING"
    | "UNDO_TURN"
    | "TUTORED"
    | "AUTO_OPTIONAL_ENGAGED"
    | "AUTO_TARGET_ENGAGED"
    | "MANUAL_MODE"
    | "LOOKING_AT_TOP_CARDS"
    | "GAIN_LOCATION_LORE"
    | "ENTER_LOCATION"
    | "SHUFFLE_DECK";
}

export interface TutoringCardEntry extends LogEntryBase {
  type: "TUTORING";
}

export interface TutoredCardEntry extends LogEntryBase {
  type: "TUTORED";
  instanceId: string;
}

export interface LookingAtTopCardsEntry extends LogEntryBase {
  type: "LOOKING_AT_TOP_CARDS";
  amount: number;
}

export interface LogEntryTap extends LogEntryBase {
  type: "TAP";
  value: boolean;
  instanceId?: string;
  cardId?: string;
  inkwell?: boolean | null;
}

export interface ResolvingAbilitiesEntry extends LogEntryBase {
  type: "RESOLVING_ABILITIES";
  abilities: ResolutionAbility[];
}

export interface LogEntryDamageChange extends LogEntryBase {
  type: "DAMAGE_CHANGE";
  from: number;
  to: number;
  // amount: number;
  instanceId: string;
}

export interface LogEntryMoveCard extends LogEntryBase {
  type: "MOVE_CARD";
  from: Zones;
  to: Zones;
  position?: "first" | "last";
  instanceId: string;
  owner: string;
}

export interface SingEntry extends LogEntryBase {
  type: "SING";
  song: string;
  singer: string;
}

export interface LogEntryQuest extends LogEntryBase {
  type: "QUEST";
  instanceId: string;
  cardId?: string;
  amount: number;
}

export interface LogEntryLoreChange extends LogEntryBase {
  type: "LORE_CHANGE";
  player?: string;
  from: number;
  to: number;
}

export interface LogEntryLoadDeck extends LogEntryBase {
  type: "LOAD_DECK";
  player: string;
}

export interface LogEntryShuffleDeck extends LogEntryBase {
  type: "SHUFFLE_DECK";
}

export interface GoingFirst extends LogEntryBase {
  type: "GOING_FIRST";
  player: string;
}

export interface PlayerJoined extends LogEntryBase {
  type: "PLAYER_JOINED";
  player: string;
}

export interface PlayerLeft extends LogEntryBase {
  type: "PLAYER_LEFT";
  player: string;
}

export interface LobbyCreated extends LogEntryBase {
  type: "LOBBY_CREATED";
  player: string;
}

export interface PlayerReady extends LogEntryBase {
  type: "PLAYER_READY";
  player: string;
}

export interface ReadyEntry extends LogEntryBase {
  type: "READY";
  player: string;
}

export interface SetEntry extends LogEntryBase {
  type: "SET";
  player: string;
}

export interface DrawEntry extends LogEntryBase {
  type: "DRAW";
  player: string;
  cards: string[];
}

export interface DiscardEntry extends LogEntryBase {
  type: "DISCARD";
  cards: string[];
}

export interface PassTurnEntry extends LogEntryBase {
  type: "PASS_TURN";
  player: string;
  turn: number;
}

export interface NewGameEntry extends LogEntryBase {
  type: "NEW_GAME";
}

export interface TurnEntry extends LogEntryBase {
  type: "NEW_TURN";
  turn: number;
  instanceId: string;
}

export interface ChallengeEntry extends LogEntryBase {
  type: "CHALLENGE";
  attacker: string;
  defender: string;
  strength: {
    attacker: number;
    defender: number;
  };
  banish: {
    attacker: boolean;
    defender: boolean;
  };
  damage: {
    attacker: number;
    defender: number;
  };
}

export interface MulliganEntry extends LogEntryBase {
  type: "MULLIGAN";
  cards: string[];
  player: string;
}

export interface ReadyToStartGameEntry extends LogEntryBase {
  type: "READY_TO_START";
  solo?: boolean;
}

export interface AddInkWellEntry extends LogEntryBase {
  type: "ADD_TO_INKWELL";
  instanceId: string;
  zone: Zones;
}
export interface WonDieRollEntry extends LogEntryBase {
  type: "WON_DIE_ROLL";
  player: string;
}

export interface GameRestartedEntry extends LogEntryBase {
  type: "GAME_RESTARTED";
  player: string;
}
export interface BackToLobbyEntry extends LogEntryBase {
  type: "BACK_TO_LOBBY";
  player: string;
}

export interface RevealCardEntry extends LogEntryBase {
  type: "REVEAL_CARD";
  player: string;
  card: string;
  from: Zones;
}

export interface ScryEntry extends LogEntryBase {
  type: "SCRY";
  bottom: number;
  top: number;
  hand: number | string[];
  shouldReveal?: boolean;
}

export interface ShiftEntry extends LogEntryBase {
  type: "SHIFT";
  shifter: string;
  shifted: string;
}
export interface ShuffleCardIntoDeckEntry extends LogEntryBase {
  type: "SHUFFLE_CARD";
  instanceId: string;
}

export interface ManualModeEntry extends LogEntryBase {
  type: "MANUAL_MODE";
  sender: string;
  toggle: boolean;
}

export interface ResolveEffectEntry extends LogEntryBase {
  type: "RESOLVE_LAYER";
  params?: ResolvingParam;
  layer?: GameEffect;
}

export interface InvalidResolutionTarget extends LogEntryBase {
  type: "INVALID_TARGET_RESOLUTION";
  effect: GameEffect;
}

export interface EffectEntry extends LogEntryBase {
  type: "EFFECT";
  effect: GameEffect;
}

export interface CancelEffectEntry extends LogEntryBase {
  type: "CANCEL_EFFECT";
  effect: GameEffect;
}

export interface SkipEffectEntry extends LogEntryBase {
  type: "SKIP_EFFECT";
}

export interface OptionalLayerAccepted extends LogEntryBase {
  type: "OPTIONAL_ABILITY_ON_STACK_ACCEPTED";
  ability?: Ability;
  source: string;
}

export interface OptionalLayerAdded extends LogEntryBase {
  type: "OPTIONAL_ABILITY_ON_STACK_ADDED";
  ability?: Ability;
  source: string;
}

export interface ConditionNotMetEntry extends LogEntryBase {
  type: "CONDITION_NOT_MET";
  layer: GameEffect;
}

export interface CantPayCostEntry extends LogEntryBase {
  type: "CANT_PAY_COSTS";
}

export interface AutoOptionalEngaged extends LogEntryBase {
  type: "AUTO_OPTIONAL_ENGAGED";
  ability?: string;
}

export interface AutoTargetEngaged extends LogEntryBase {
  type: "AUTO_TARGET_ENGAGED";
  targets: string[];
}

export interface UndoTurnEntry extends LogEntryBase {
  type: "UNDO_TURN";
  turn: number;
}

export interface UndoTurnEntry extends LogEntryBase {
  type: "UNDO_TURN";
  turn: number;
}

export interface EnterLocationEntry extends LogEntryBase {
  type: "ENTER_LOCATION";
  location: string;
  character: string;
}

export interface GainLocationLore extends LogEntryBase {
  type: "GAIN_LOCATION_LORE";
  location: string;
  player: string;
  lore: number;
}
