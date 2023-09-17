import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import admin, { adminDatabase } from "~/3rd-party/firebase/admin";
import { z } from "zod";
import {
  createCards,
  createEmptyGame,
  createTable,
  createTableFromCards,
  type Game,
  GameLobby,
  recreateTable,
} from "~/libs/game";
import { drawCardHelper } from "~/3rd-party/firebase/database/mutableHelpers";
import {
  type Deck,
  type Table,
  type TableCard,
} from "~/providers/TabletopProvider";
import { parseDeckList } from "~/spaces/table/deckbuilder/parseDeckList";
import {
  deleteChannelMessages,
  sendLog,
  updateStreamGameChat,
} from "~/server/serverGameLogger";

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

      // TODO: to avoid polluted data, we should recreate the game from scratch
      const gameReference = adminDatabase.ref(`games/${gameId}`);
      const updates: Record<string, unknown> = {};
      updates[`players/${userUID}`] = true;
      updates[`tables/${userUID}`] = createTable();
      updates[`mode`] = "multiplayer";
      updates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
      await gameReference.update(updates);

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

      const cardsRef = adminDatabase.ref(`games/${gameId}/cards`);
      await cardsRef.transaction((cards: Record<string, TableCard>) => {
        if (!cards) {
          return cards;
        }

        Object.keys(cards).forEach((cardId) => {
          const tableCard = cards[cardId];
          if (tableCard && tableCard.ownerId === userUID) {
            //@ts-expect-error this is how we delete a firebase record
            cards[cardId] = null;
          }
        });

        return cards;
      });

      //TODO: REMOVE STREAM MEMBER !!

      const gameReference = adminDatabase.ref(`games/${gameId}`);
      const updates: Record<string, null | ""> = {};
      updates[`players/${userUID}`] = null;
      updates[`tables/${userUID}`] = null;
      updates[`wonDieRoll`] = null;
      updates[`turnPlayer`] = "";
      await gameReference.update(updates);

      const lobbyReference = adminDatabase.ref(`lobbies/${gameId}`);
      const lobbyUpdates: Record<string, unknown> = {};
      lobbyUpdates[`players/${userUID}`] = null;
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
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const { deckList, gameId } = input;

      const playersReference = adminDatabase.ref(
        `lobbies/${gameId}/players/${userUID}`
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

      const gameReference = adminDatabase.ref(`games/${gameId}`);
      const updates: Record<string, unknown> = {};
      updates[`tables/${userUID}`] = table;
      updates[`turnPlayer`] = "";
      await gameReference.update(updates);

      const cardsRef = adminDatabase.ref(`games/${gameId}/cards`);
      await cardsRef.transaction((cards: Record<string, TableCard>) => {
        if (!cards) {
          const init: Record<string, TableCard> = {};
          Object.values(deckCards).forEach((tableCard) => {
            init[tableCard.instanceId] = tableCard;
          });
          return init;
        }

        Object.values(cards).forEach((tableCard) => {
          if (tableCard.ownerId === userUID) {
            //@ts-expect-error this is how we delete a firebase record
            cards[tableCard.instanceId] = null;
          }
        });

        Object.values(deckCards).forEach((tableCard) => {
          cards[tableCard.instanceId] = tableCard;
        });

        return cards;
      });

      // Whene creating the lobby/game, we don't have the streamId yet
      await updateStreamGameChat(userUID, gameId);

      await sendLog(gameId, { type: "LOAD_DECK" });
    }),

  restartGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const gameId = input.gameId;

      const playersReference = adminDatabase.ref(`games/${gameId}/tables`);
      const players = await playersReference.get();

      if (!players.exists() || !Object.keys(players.val()).includes(userUID)) {
        console.log(players.val());
        throw new Error("You are not a player in this game.");
      }

      const tablesReference = adminDatabase.ref(`games/${gameId}/tables`);
      await tablesReference.transaction((tables: Game["tables"]) => {
        let response: Record<string, Table> = {};

        if (tables) {
          response = tables;
        }

        Object.keys(response).forEach((tableId) => {
          response[tableId] = recreateTable(tables[tableId]);
        });

        return response;
      });

      await adminDatabase
        .ref(`games/${gameId}/cards`)
        .transaction((cards: Game["cards"]) => {
          if (!cards) {
            return cards;
          }

          Object.keys(cards).forEach((card) => {
            const tableCard = cards[card];
            if (tableCard) {
              cards[card] = { ...tableCard, meta: null };
            }
          });

          return cards;
        });

      const gameReference = adminDatabase.ref(`games/${gameId}`);
      const updates: Record<string, unknown> = {};
      // updates[`turnPlayer`] = "";
      updates[`turnCount`] = 0;
      // updates[`mode`] = "multiplayer";
      updates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
      await gameReference.update(updates);
      await deleteChannelMessages(gameId);
      await adminDatabase.ref(`logs/${gameId}`).set(null);
      await sendLog(gameId, { type: "GAME_RESTARTED", player: userUID });
    }),

  passTurn: protectedProcedure
    .input(z.object({ gameId: z.string(), forcePass: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const { gameId, forcePass } = input;
      const gameReference = adminDatabase.ref(`games/${gameId}/`);

      const turnPlayerReference = adminDatabase.ref(
        `games/${gameId}/turnPlayer`
      );
      const turnPlayer = (await turnPlayerReference.get()).val();
      const gameModeReference = adminDatabase.ref(`games/${gameId}/mode`);
      const gameMode = (await gameModeReference.get()).val();

      if (!forcePass) {
        // Double click protection
        if (gameMode === "multiplayer" && turnPlayer !== userUID) {
          throw new Error("Turn player mismatch. " + turnPlayer + userUID);
        }
      }

      if (turnPlayer.length === 0) {
        await gameReference.child("turnPlayer").set(userUID);
        await gameReference.child("turnCount").set(0);

        await sendLog(gameId, { type: "GOING_FIRST", player: userUID });
        return;
      }

      const nextPlayer = await findNextPlayer(
        gameId,
        userUID,
        turnPlayer,
        gameMode
      );

      let drawnCard = "";

      await adminDatabase
        .ref(`games/${gameId}/cards`)
        .transaction((cards: Record<string, TableCard>) => {
          if (!cards) {
            return cards;
          }

          Object.values(cards).forEach((card) => {
            if (card.ownerId === nextPlayer && card.meta) {
              card.meta.exerted = null;
              card.meta.playedThisTurn = null;
            }
          });

          return cards;
        });

      await adminDatabase
        .ref(`games/${gameId}/tables/${nextPlayer}`)
        .transaction((table: Table) => {
          if (!table) {
            console.error("Table not found: ", gameId);
            return table;
          }

          const mutatedTable = drawCardHelper(table);
          drawnCard = mutatedTable?.zones?.hand?.slice(-1)[0] || "";

          return mutatedTable;
        });

      const updates: Record<string, unknown> = {};
      updates[`turnPlayer`] = nextPlayer;
      updates[`turnCount`] = admin.database.ServerValue.increment(1);
      updates[`lastActivity`] = admin.database.ServerValue.TIMESTAMP;
      await gameReference.update(updates);

      // await sendLog(
      //   gameId,
      //   { type: "PASS_TURN", player: turnPlayer, turn: "SERVER" },
      //   turnPlayer
      // );

      const turnCount = (
        await adminDatabase.ref(`games/${gameId}/turnCount`).get()
      ).val();

      await sendLog(
        gameId,
        {
          type: "NEW_TURN",
          turn: turnCount,
          instanceId: drawnCard,
          // @ts-expect-error I need to refactor log system
          private: { [nextPlayer]: { instanceId: drawnCard } },
        },
        nextPlayer
      );
    }),

  startGame: protectedProcedure
    .input(z.object({ gameId: z.string(), playerGoingFirst: z.string() }))
    .mutation(async ({ input }) => {
      const { gameId, playerGoingFirst } = input;

      // TODO: Check whethere player exists

      await adminDatabase
        .ref(`games/${gameId}/turnPlayer`)
        .set(playerGoingFirst);
      await adminDatabase.ref(`games/${gameId}/turnCount`).set(0);

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

      await adminDatabase
        .ref(`games/${gameId}/tables/${playerId}/readyToStart`)
        .set(true);

      if (solo) {
        await adminDatabase.ref(`games/${gameId}/mode`).set("solo");
      }
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
        (player) => players[player] || player == playerId
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
  gameMode: Game["mode"]
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
