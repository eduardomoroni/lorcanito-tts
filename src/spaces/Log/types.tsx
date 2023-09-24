import type { Zones } from "~/providers/TabletopProvider";
import { GameEffect } from "~/libs/game";

import { ResolutionAbility } from "~/engine/rules/abilities/abilities";

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

interface LogEntryBase {
  type:
    | "TAP"
    | "DAMAGE_CHANGE"
    | "GAME_RESTARTED"
    | "SHUFFLE_CARD"
    | "SING"
    | "MOVE_CARD"
    | "REVEAL_CARD"
    | "BACK_TO_LOBBY"
    | "QUEST"
    | "WON_DIE_ROLL"
    | "CANCEL_EFFECT"
    | "RESOLVE_EFFECT"
    | "EFFECT"
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
    | "SET"
    | "CHALLENGE"
    | "RESOLVING_ABILITIES"
    | "DRAW"
    | "TUTORING"
    | "TUTORED"
    | "LOOKING_AT_TOP_CARDS"
    | "SHUFFLE_DECK";
}

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
  | PassTurnEntry
  | EffectEntry
  | ResolveEffectEntry
  | CancelEffectEntry
  | SingEntry
  | SetEntry
  | DrawEntry
  | RevealCardEntry
  | BackToLobbyEntry
  | GameRestartedEntry
  | LogEntryDamageChange
  | LogEntryLoadDeck
  | LogEntryShuffleDeck
  | LogEntryLoreChange
  | ReadyToStartGameEntry
  | LookingAtTopCardsEntry
  | LogEntryMoveCard
  | MulliganEntry
  | TutoringCardEntry
  | TutoredCardEntry
  | LogEntryQuest;

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
}

export interface LogEntryShuffleDeck extends LogEntryBase {
  type: "SHUFFLE_DECK";
}

export interface GoingFirst extends LogEntryBase {
  type: "GOING_FIRST";
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

export interface ResolveEffectEntry extends LogEntryBase {
  type: "RESOLVE_EFFECT";
  targetId?: string;
  effect?: GameEffect;
}
export interface EffectEntry extends LogEntryBase {
  type: "EFFECT";
  effect: GameEffect;
}

export interface CancelEffectEntry extends LogEntryBase {
  type: "CANCEL_EFFECT";
  effect: GameEffect;
}

export interface ShuffleCardIntoDeckEntry extends LogEntryBase {
  type: "SHUFFLE_CARD";
  instanceId: string;
}
