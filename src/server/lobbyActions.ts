import admin, {
  adminDatabase,
  adminFirestore,
} from "~/libs/3rd-party/firebase/admin";
import {
  deleteChannelMessages,
  removeStreamGameChat,
  sendLog,
  updateStreamGameChat,
} from "~/server/serverGameLogger";
import { parseDeckList } from "~/client/table/deckbuilder/parseDeckList";
import {
  createCards,
  createTableFromCards,
  type Game,
  type GameLobby,
  type Deck,
  recreateTable,
  type TableCard,
} from "@lorcanito/engine";
import { getFirestoreGame } from "~/libs/3rd-party/firebase/firestore";
import { createGameLobby } from "~/libs/3rd-party/firebase/database/game";
import { Random } from "~/libs/random";
import { LOBBIES_CHANNEL_ID } from "~/client/providers/stream-chat-provider/constants";

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

export async function createLobby(userUid: string, lobbyId?: string) {
  const gameLobby = await createGameLobby(userUid, lobbyId);

  await sendLog(
    LOBBIES_CHANNEL_ID,
    {
      type: "LOBBY_CREATED",
      player: userUid,
    },
    userUid,
    true,
  );

  return gameLobby;
}

export async function joinLobby(userUID: string, gameId: string) {
  await updateStreamGameChat(userUID, gameId);

  // TODO: Add a check that at max 2 players can join a game

  const lobbyReference = adminDatabase.ref(`lobbies/${gameId}`);
  const lobbyUpdates: Record<string, unknown> = {};
  lobbyUpdates[`players/${userUID}`] = false;
  lobbyUpdates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
  await lobbyReference.update(lobbyUpdates);

  // TODO: THIs is firing multiple times, on page reload
  await sendLog(
    gameId,
    {
      type: "PLAYER_JOINED",
      player: userUID,
    },
    userUID,
    true,
  );
}

export async function leaveLobby(userUID: string, gameId: string) {
  await removeStreamGameChat(userUID, gameId);

  const lobbyReference = adminDatabase.ref(`lobbies/${gameId}`);
  const playersReference = await adminDatabase
    .ref(`lobbies/${gameId}/players`)
    .get();
  const players = playersReference.val() as Record<string, boolean>;
  const playerCount = Object.keys(players).length;

  if (playerCount === 1) {
    await lobbyReference.set(null);
    await adminDatabase.ref(`presence/lobbies/${gameId}`).set(null);
  } else {
    const lobbyUpdates: Record<string, unknown> = {};
    lobbyUpdates[`players/${userUID}`] = null;
    lobbyUpdates[`deckLists/${userUID}`] = null;
    lobbyUpdates[`wonDieRoll`] = null;
    lobbyUpdates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
    await lobbyReference.update(lobbyUpdates);
  }

  await sendLog(
    gameId,
    {
      type: "PLAYER_LEFT",
      player: userUID,
    },
    userUID,
    true,
  );
}

export async function saveDeckList(
  userUID: string,
  gameId: string,
  deckList: string,
) {
  const lobbyReference = adminDatabase.ref(`lobbies/${gameId}`);
  const lobbyUpdates: Record<string, unknown> = {};
  lobbyUpdates[`deckLists/${userUID}`] = deckList;
  lobbyUpdates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
  await sendLog(
    gameId,
    {
      type: "LOAD_DECK",
      player: userUID,
    },
    userUID,
  );

  await lobbyReference.update(lobbyUpdates);
}

export async function startGame(gameId: string, playerGoingFirst: string) {
  const dataSnapshot = await adminDatabase.ref(`lobbies/${gameId}`).get();
  const lobby = dataSnapshot.val() as GameLobby;

  const players = Object.keys(lobby.players);

  if (players.length > 2) {
    throw new Error("Too many players in lobby.");
  }

  const game = await getFirestoreGame(gameId);

  players.forEach((player) => {
    loadDeck(player, game, lobby);
  });

  game.turnPlayer = playerGoingFirst;
  game.priorityPlayer = playerGoingFirst;
  game.turnCount = 0;

  await adminFirestore.doc(`games/${gameId}`).set(game);
  await adminDatabase.ref(`lobbies/${gameId}/gameStarted`).set(true);

  await sendLog(
    gameId,
    {
      type: "GOING_FIRST",
      player: playerGoingFirst,
    },
    playerGoingFirst,
    true,
  );
}

export async function lobbyReady(playerId: string, gameId: string) {
  const playersReference = adminDatabase.ref(`lobbies/${gameId}/players`);
  const playersSnapshot = await playersReference.get();
  const players = playersSnapshot.val() as Record<string, boolean>;
  const playersArray = Object.keys(players);
  const allPlayersReady = playersArray.every(
    (player) => players[player] || player == playerId,
  );
  const lobbyReference = adminDatabase.ref(`lobbies/${gameId}`);
  const lobbyUpdates: Record<string, unknown> = {};
  lobbyUpdates[`players/${playerId}`] = true;
  lobbyUpdates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;

  // TODO: set game to solo mode if only one player
  if (allPlayersReady) {
    const player = getRandomElement(playersArray);
    lobbyUpdates[`wonDieRoll`] = player;
    await sendLog(gameId, { type: "WON_DIE_ROLL", player });
    await adminDatabase.ref(`presence/lobbies/${gameId}`).remove();
  }

  await lobbyReference.update(lobbyUpdates);
  await sendLog(
    gameId,
    {
      type: "PLAYER_READY",
      player: playerId,
    },
    playerId,
    true,
  );
}

export async function backToLobby(gameId: string, userUID: string) {
  await createLobby(userUID, gameId);
}

export async function restartGame(gameId: string, userUID: string) {
  const gameReference = adminFirestore.doc(`games/${gameId}`);
  const game = await getFirestoreGame(gameId);
  const players = game.tables;

  if (!Object.keys(players || {}).includes(userUID)) {
    throw new Error("You are not a player in this game.");
  }
  await deleteChannelMessages(gameId);

  // TODO: Move this to store
  game.effects = [];
  game.continuousEffects = [];
  game.triggeredAbilities = [];

  Object.keys(game.tables || {}).forEach((tableId) => {
    game.tables[tableId] = recreateTable(game.tables[tableId]);
  });

  Object.keys(game.cards || {}).forEach((card) => {
    const tableCard = game.cards[card];
    if (tableCard) {
      game.cards[card] = { ...tableCard, meta: null };
    }
  });

  game.turnCount = 0;
  game.winner = null;
  game.seed = Random.seed();

  await gameReference.set(game);

  await adminDatabase.ref(`logs/${gameId}`).set(null);
  await sendLog(
    gameId,
    { type: "GAME_RESTARTED", player: userUID },
    userUID,
    true,
  );
}

async function loadDeck(userUID: string, game: Game, lobby: GameLobby) {
  const deckList = lobby.deckLists[userUID];
  if (!deckList) {
    throw new Error("No decklist found.");
  }
  const deck: Deck = parseDeckList(deckList);
  const deckCards = createCards(deck, userUID);

  if (Object.values(deckCards).length < 10) {
    throw new Error("Deck must contain at least 10 cards.");
  }
  const table = createTableFromCards(deckCards);

  game.tables[userUID] = table;
  game.turnPlayer = "";

  if (!game.cards) {
    game.cards = {};

    Object.values(deckCards).forEach((tableCard: TableCard) => {
      game.cards[tableCard.instanceId] = tableCard;
    });
  } else {
    Object.values(game.cards || {}).forEach((tableCard) => {
      if (tableCard?.ownerId === userUID) {
        //@ts-expect-error this is how we delete a firebase record
        game.cards[tableCard.instanceId] = null;
      }
    });

    Object.values(deckCards || {}).forEach((tableCard: TableCard) => {
      game.cards[tableCard.instanceId] = tableCard;
    });
  }
}
