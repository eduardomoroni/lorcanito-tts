import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import admin, {
  adminDatabase,
  adminFirestore,
} from "~/libs/3rd-party/firebase/admin";
import { z } from "zod";
import {
  createCards,
  createTable,
  createTableFromCards,
  type Game,
  GameLobby,
  recreateTable,
} from "~/libs/game";
import { type Deck } from "~/spaces/providers/TabletopProvider";
import { parseDeckList } from "~/spaces/table/deckbuilder/parseDeckList";
import {
  deleteChannelMessages,
  sendLog,
  updateStreamGameChat,
} from "~/server/serverGameLogger";
import { firestore } from "firebase-admin";
import FieldValue = firestore.FieldValue;
import { getFirestoreGame } from "~/libs/3rd-party/firebase/firestore";

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

export const gameRouter = createTRPCRouter({
  joinGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const gameId = input.gameId;

      await updateStreamGameChat(userUID, gameId);

      const gameReference = adminFirestore.doc(`games/${gameId}`);
      const game = await getFirestoreGame(gameId);

      const batch = adminFirestore.batch();
      console.log(input);
      // TODO: to avoid polluted data, we should recreate the game from scratch

      game.players[userUID] = true;
      game.tables[userUID] = createTable();
      game.turnPlayer = "";
      // @ts-expect-error
      game.lastActivity = FieldValue.serverTimestamp();
      game.mode = "multiplayer";

      await gameReference.set(game);

      // TODO: Add a check that at max 2 players can join a game

      const lobbyReference = adminDatabase.ref(`lobbies/${gameId}`);
      const lobbyUpdates: Record<string, unknown> = {};
      lobbyUpdates[`players/${userUID}`] = false;
      lobbyUpdates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
      await lobbyReference.update(lobbyUpdates);
    }),

  leaveGame: protectedProcedure
    .input(z.object({ gameId: z.string(), playerId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userUID = input.playerId || ctx.session.user.uid;
      const gameId = input.gameId;

      // TODO: Do it in a smart way
      // if (ctx.session.user.uid !== userUID && ctx.session.user.uid !== gameId) {
      //   console.info("Non-owner trying to kick out a player.");
      //   return;
      // }

      const gameReference = adminFirestore.doc(`games/${gameId}`);
      const game = await getFirestoreGame(gameId);

      Object.keys(game.cards).forEach((cardId) => {
        const tableCard = game.cards[cardId];
        if (tableCard && tableCard.ownerId === userUID) {
          //@ts-expect-error this is how we delete a firebase record
          game.cards[cardId] = null;
        }
      });

      Object.keys(game.tables).forEach((table) => {
        const tableCard = game.tables[table];
        if (tableCard) {
          tableCard.readyToStart = false;
        }
      });

      // @ts-expect-error this is how we delete a firebase record
      game.players[userUID] = null;
      // @ts-expect-error this is how we delete a firebase record
      game.tables[userUID] = null;
      game.turnPlayer = "";

      await gameReference.set(game);

      //TODO: REMOVE STREAM MEMBER !!

      const lobbyReference = adminDatabase.ref(`lobbies/${gameId}`);
      const lobbyUpdates: Record<string, unknown> = {};
      lobbyUpdates[`players/${userUID}`] = null;
      lobbyUpdates[`wonDieRoll`] = null;
      lobbyUpdates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
      await lobbyReference.update(lobbyUpdates);
      await adminDatabase.ref(`presence/lobbies/${gameId}`).set(null);
    }),

  loadDeck: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        deckList: z.string().optional(),
        deck: z
          .array(
            z.object({
              cardId: z.string(),
              qty: z.number(),
              card: z.unknown(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const { deckList, gameId } = input;

      const playersReference = adminDatabase.ref(
        `lobbies/${gameId}/players/${userUID}`,
      );
      const playersSnapshot = await playersReference.get();
      const players = playersSnapshot.val() as Record<string, string>;
      if (!playersSnapshot.exists()) {
        console.log(players);
        throw new Error("You are not a player in this game.");
      }

      const deck: Deck = (input.deck as Deck) || parseDeckList(deckList || "");
      const deckCards = createCards(deck, userUID);
      if (Object.values(deckCards).length < 10) {
        console.log(deck);
        console.log(Object.values(deckCards));
        throw new Error("Deck must contain at least 10 cards.");
      }
      const table = createTableFromCards(deckCards);

      const gameReference = adminFirestore.doc(`games/${gameId}`);
      const game = await getFirestoreGame(gameId);

      game.tables[userUID] = table;
      game.turnPlayer = "";

      if (!game.cards) {
        game.cards = {};

        Object.values(deckCards).forEach((tableCard) => {
          game.cards[tableCard.instanceId] = tableCard;
        });
      } else {
        Object.values(game.cards).forEach((tableCard) => {
          if (tableCard.ownerId === userUID) {
            //@ts-expect-error this is how we delete a firebase record
            cards[tableCard.instanceId] = null;
          }
        });

        Object.values(deckCards).forEach((tableCard) => {
          game.cards[tableCard.instanceId] = tableCard;
        });
      }

      await gameReference.set(game);

      await updateStreamGameChat(userUID, gameId);
      await sendLog(gameId, { type: "LOAD_DECK" });
    }),

  restartGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const gameId = input.gameId;

      const gameReference = adminFirestore.doc(`games/${gameId}`);
      const game = await getFirestoreGame(gameId);
      const players = game.tables;

      if (!Object.keys(players || {}).includes(userUID)) {
        throw new Error("You are not a player in this game.");
      }

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
      // @ts-expect-error this is how we delete a firebase record
      game.lastActivity = FieldValue.serverTimestamp();

      await gameReference.set(game);

      await deleteChannelMessages(gameId);
      await adminDatabase.ref(`logs/${gameId}`).set(null);
      await sendLog(gameId, { type: "GAME_RESTARTED", player: userUID });
    }),

  passTurn: protectedProcedure
    .input(z.object({ gameId: z.string(), forcePass: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      // const userUID = ctx.session.user.uid;
      // const { gameId, forcePass } = input;
      // const gameReference = adminDatabase.ref(`games/${gameId}/`);
      //
      // const turnPlayerReference = adminDatabase.ref(
      //   `games/${gameId}/turnPlayer`,
      // );
      // const turnPlayer = (await turnPlayerReference.get()).val();
      // const gameModeReference = adminDatabase.ref(`games/${gameId}/mode`);
      // const gameMode = (await gameModeReference.get()).val();
      //
      // if (!forcePass) {
      //   // Double click protection
      //   if (gameMode === "multiplayer" && turnPlayer !== userUID) {
      //     throw new Error("Turn player mismatch. " + turnPlayer + userUID);
      //   }
      // }
      //
      // if (turnPlayer.length === 0) {
      //   await gameReference.child("turnPlayer").set(userUID);
      //   await gameReference.child("turnCount").set(0);
      //
      //   await sendLog(gameId, { type: "GOING_FIRST", player: userUID });
      //   return;
      // }
      //
      // const nextPlayer = await findNextPlayer(
      //   gameId,
      //   userUID,
      //   turnPlayer,
      //   gameMode,
      // );
      //
      // let drawnCard = "";
      //
      // await adminDatabase
      //   .ref(`games/${gameId}/cards`)
      //   .transaction((cards: Record<string, TableCard>) => {
      //     if (!cards) {
      //       return cards;
      //     }
      //
      //     Object.values(cards).forEach((card) => {
      //       if (card.ownerId === nextPlayer && card.meta) {
      //         card.meta.exerted = null;
      //         card.meta.playedThisTurn = null;
      //       }
      //     });
      //
      //     return cards;
      //   });
      //
      // await adminDatabase
      //   .ref(`games/${gameId}/tables/${nextPlayer}`)
      //   .transaction((table: Table) => {
      //     if (!table) {
      //       console.error("Table not found: ", gameId);
      //       return table;
      //     }
      //
      //     const mutatedTable = drawCardHelper(table);
      //     drawnCard = mutatedTable?.zones?.hand?.slice(-1)[0] || "";
      //
      //     return mutatedTable;
      //   });
      //
      // const updates: Record<string, unknown> = {};
      // updates[`turnPlayer`] = nextPlayer;
      // updates[`turnCount`] = admin.database.ServerValue.increment(1);
      // updates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
      // await gameReference.update(updates);
      //
      // // await sendLog(
      // //   gameId,
      // //   { type: "PASS_TURN", player: turnPlayer, turn: "SERVER" },
      // //   turnPlayer
      // // );
      //
      // const turnCount = (
      //   await adminDatabase.ref(`games/${gameId}/turnCount`).get()
      // ).val();
      //
      // await sendLog(
      //   gameId,
      //   {
      //     type: "NEW_TURN",
      //     turn: turnCount,
      //     instanceId: drawnCard,
      //     // @ts-expect-error I need to refactor log system
      //     private: { [nextPlayer]: { instanceId: drawnCard } },
      //   },
      //   nextPlayer,
      // );
    }),

  startGame: protectedProcedure
    .input(z.object({ gameId: z.string(), playerGoingFirst: z.string() }))
    .mutation(async ({ input }) => {
      const { gameId, playerGoingFirst } = input;

      const gameReference = adminFirestore.doc(`games/${gameId}`);
      const game = await getFirestoreGame(gameId);

      if (!game.tables[playerGoingFirst]) {
        throw new Error("Player not found in game.");
      }

      game.turnPlayer = playerGoingFirst;
      game.turnCount = 0;

      await gameReference.set(game);

      await adminDatabase.ref(`lobbies/${gameId}/gameStarted`).set(true);

      await sendLog(gameId, {
        type: "GOING_FIRST",
        player: playerGoingFirst,
      });
    }),

  backToLobby: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { gameId } = input;

      await adminDatabase
        .ref(`lobbies/${gameId}`)
        .transaction((lobby: GameLobby) => {
          if (!lobby) {
            return lobby;
          }

          lobby.gameStarted = false;
          lobby.wonDieRoll = null;

          Object.keys(lobby.players).forEach((playerId) => {
            if (lobby.players[playerId]) {
              lobby.players[playerId] = false;
            }
          });

          return lobby;
        });

      // TODO: send a back to lobby message
      await sendLog(gameId, {
        type: "BACK_TO_LOBBY",
        player: ctx.session.user.uid,
      });
    }),

  readyToStart: protectedProcedure
    .input(z.object({ gameId: z.string(), solo: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { gameId, solo } = input;
      const playerId = ctx.session.user.uid;

      await sendLog(gameId, { type: "READY_TO_START", solo }, playerId);

      await adminFirestore
        .doc(`games/${gameId}/tables/${playerId}`)
        .update({ readyToStart: true, mode: solo ? "solo" : "multiplayer" });
    }),

  lobbyReady: protectedProcedure
    .input(z.object({ gameId: z.string(), solo: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { gameId, solo } = input;
      const playerId = ctx.session.user.uid;

      const playersReference = adminDatabase.ref(`lobbies/${gameId}/players`);
      const playersSnapshot = await playersReference.get();
      const players = playersSnapshot.val() as Record<string, boolean>;
      const playersArray = Object.keys(players);
      const allPlayersReady = playersArray.every(
        (player) => players[player] || player == playerId,
      );
      console.log(playersArray);
      console.log(allPlayersReady);

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
    }),

  // TODO: REMOVE THIS FUNCTION
  purgeAndRecreateGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { gameId } = input;
      const playerId = ctx.session.user.uid;

      return null;

      // if (playerId !== gameId) {
      //   console.info("Non-owner trying to purge a game.");
      //   return;
      // }
      //
      // const game = createEmptyGame(
      //   gameId,
      //   admin.database.ServerValue.TIMESTAMP
      // );
      // await adminDatabase.ref(`games/${gameId}`).set(game);
    }),
});

async function findNextPlayer(
  gameId: string,
  userUID: string,
  turnPlayer: string,
  gameMode: Game["mode"],
) {
  if (gameMode === "solo") {
    return userUID;
  }

  const playersReference = adminDatabase.ref(`games/${gameId}/tables`);
  const playersSnapshot = await playersReference.get();
  const tables = playersSnapshot.val() as Game["tables"];
  const players = Object.keys(tables);
  const activePlayer = userUID;

  // In case there's no opponent we consider a solo match
  const opponent = players.find((p) => p !== activePlayer) || userUID;
  // This is useful for debugging, so I can pass turn from a single player game
  return turnPlayer === activePlayer ? opponent : activePlayer;
}
