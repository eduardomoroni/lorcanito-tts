import type {
  Deck,
  Table,
  TableCard,
} from "~/spaces/providers/TabletopProvider";
import { createId } from "@paralleldrive/cuid2";
import { shuffleDeck } from "~/libs/shuffle";

import type {
  Ability,
  DelayedTriggeredAbility,
} from "~/engine/rules/abilities/abilities";
import { ContinuousEffect } from "~/engine/rules/effects/effectTypes";

export type GameEffect = {
  instanceId: string;
  id: string;
  responder: string;
  ability: Ability;
};

export type Game = {
  id: string;
  lastActionId: number;
  lastActivity?: number;
  visibility: "public" | "private";
  turnPlayer: string;
  turnCount: number;
  mode: "solo" | "multiplayer";
  wonDieRoll?: string | null;
  tables: Record<string, Table>;
  players: Record<string, boolean>;
  cards: Record<string, TableCard>;
  effects: GameEffect[];
  continuousEffects: ContinuousEffect[];
  triggeredAbilities: DelayedTriggeredAbility[];
};

export type GameLobby = {
  id: string;
  name: string;
  gameId: string;
  ownerId: string;
  visibility: "public" | "private";
  players: Record<string, boolean>;
  lastActivity?: string;
  wonDieRoll?: string | null;
  gameStarted: boolean;
};

function createTableCard(cardId: string, ownerId: string) {
  return {
    instanceId: createId(),
    cardId: cardId,
    ownerId,
  };
}

export const createCards = (
  deck: Deck,
  ownerId: string,
): Record<string, TableCard> => {
  const cards: Record<string, TableCard> = {};

  [...deck].forEach(({ qty, cardId }) => {
    // range
    [...Array(qty).keys()].forEach(() => {
      const tableCard: TableCard = createTableCard(cardId, ownerId);

      cards[tableCard.instanceId] = tableCard;
    });
  });

  return cards;
};

export function createTableFromCards(cards: Record<string, TableCard>): Table {
  const table = createTable();
  // table.cards = JSON.parse(JSON.stringify(cards));

  const deck = Object.entries(cards).reduce((acc: string[], [key, value]) => {
    acc.push(key);
    return acc;
  }, []);

  const shuffledDeck = shuffleDeck([...deck]);
  table.zones.hand = shuffledDeck.slice(0, 7);
  table.zones.deck = shuffledDeck.slice(7);

  return table;
}

export function recreateTable(sourceTable?: Table): Table {
  if (!sourceTable) {
    return createTable();
  }
  const newTable = JSON.parse(JSON.stringify(sourceTable));

  newTable.lore = 0;
  newTable.readyToStart = false;
  newTable.cardsAddedToInkWellThisTurn = 0;

  if (!newTable.zones) {
    newTable.zones = {
      inkwell: [],
      hand: [],
      play: [],
      discard: [],
      deck: [],
    };
  }

  // Case where deck is empty, firebase will remove the key
  if (!newTable.zones.deck) {
    newTable.zones.deck = [];
  }

  Object.keys(newTable.zones).forEach((zone) => {
    if (zone === "deck") {
      return;
    }

    newTable.zones.deck = newTable.zones.deck.concat(
      newTable.zones[zone] || [],
    );
    newTable.zones[zone] = [];
  });

  const shuffledDeck = shuffleDeck(newTable.zones.deck);
  newTable.zones.hand = shuffledDeck.slice(0, 7);
  newTable.zones.deck = shuffledDeck.slice(7);

  return newTable;
}

export function createTable(): Table {
  return {
    readyToStart: false,
    lore: 0,
    cardsAddedToInkWellThisTurn: 0,
    zones: {
      inkwell: [],
      hand: [],
      play: [],
      discard: [],
      deck: [],
    },
  };
}

export function createEmptyGame(
  gameId: string,
  lastActivity: unknown = null,
): Game {
  const game: Game = {
    id: gameId,
    lastActionId: 0,
    visibility: "public",
    mode: "multiplayer",
    turnPlayer: "",
    turnCount: 0,
    // @ts-expect-error
    lastActivity: lastActivity || Date.now() + "",
    players: {},
    tables: {},
    cards: {},
    effects: [],
    continuousEffects: [],
    triggeredAbilities: [],
  };

  return game;
}

export function createEmptyGameLobby(
  id: string,
  gameId: string,
  userId: string,
  name: string,
  lastActivity?: string,
): GameLobby {
  return {
    id: id,
    gameId: gameId,
    ownerId: userId,
    visibility: "public",
    lastActivity: lastActivity || Date.now() + "",
    name: name,
    gameStarted: false,
    players: {
      // Player joined but it's not ready
      [userId]: false,
    },
  };
}
