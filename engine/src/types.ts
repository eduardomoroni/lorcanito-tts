import type {
  Ability,
  DelayedTriggeredAbility,
} from "@lorcanito/engine/rules/abilities/abilities";
import type {
  ContinuousEffect,
  ScryEffectPayload,
} from "@lorcanito/engine/rules/effects/effectTypes";
import type { CardModel } from "@lorcanito/engine/store/models/CardModel";

export type ResolvingParam = {
  targets?: CardModel[];
  player?: string;
  scry?: ScryEffectPayload;
  skip?: boolean;
};

export type GameEffect = {
  instanceId: string;
  id: string;
  responder: string;
  ability: Ability;
};

export type Zones = "hand" | "play" | "discard" | "inkwell" | "deck";

export type TableZones = Record<Zones, string[] | undefined>;

export type Meta = {
  exerted?: boolean | null;
  playedThisTurn?: boolean | null;
  damage?: number | null;
  shifter?: string | null;
  shifted?: string | null;
  revealed?: boolean | null;
  continuousEffects?: string[];
  location?: string | null;
  characters?: string[] | null;
};

export type Table = {
  //TODO: add game id
  zones: TableZones;
  lore: number;
  readyToStart?: boolean;
  turn: {
    cardsAddedToInkWell: string[];
    cardsPlayed: string[];
    cardsDiscarded: string[];
    challenges: Array<{ attacker: string; defender: string }>;
  };
};

export type TableCard = {
  instanceId: string;
  cardId: string;
  ownerId: string;
  meta?: Meta | null;
};

export type Game = {
  hash?: string;
  seed: string;
  id: string;
  winner?: string | null;
  lastActionId: number;
  lastActivity?: number;
  visibility: "public" | "private";
  turnPlayer: string;
  priorityPlayer: string;
  turnCount: number;
  mode: "solo" | "multiplayer";
  manualMode?: boolean;
  wonDieRoll?: string | null;
  tables: Record<string, Table>;
  // @Deprecated - please use tables instead
  players: Record<string, boolean>;
  cards: Record<string, TableCard>;
  effects: GameEffect[];
  continuousEffects: ContinuousEffect[];
  triggeredAbilities: DelayedTriggeredAbility[];
  undoState?: string;
};
