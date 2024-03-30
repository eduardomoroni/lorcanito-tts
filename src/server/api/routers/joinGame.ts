import { createTRPCRouter, authenticatedProcedure } from "~/server/api/trpc";
import { adminDatabase } from "~/libs/3rd-party/firebase/admin";
import { z } from "zod";
import { sendLog } from "~/server/serverGameLogger";

import {
  backToLobby,
  joinLobby,
  leaveLobby,
  lobbyReady,
  restartGame,
  saveDeckList,
  startGame,
} from "~/server/lobbyActions";

export const gameRouter = createTRPCRouter({
  joinGameLobby: authenticatedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const gameId = input.gameId;

      return joinLobby(userUID, gameId);
    }),

  leaveGameLobby: authenticatedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { gameId } = input;
      const playerId = ctx.session.user.uid;
      return leaveLobby(playerId, gameId);
    }),

  loadDeck: authenticatedProcedure
    .input(
      z.object({
        gameId: z.string(),
        deckList: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const { deckList, gameId } = input;
      return saveDeckList(userUID, gameId, deckList);
    }),

  startGame: authenticatedProcedure
    .input(z.object({ gameId: z.string(), playerGoingFirst: z.string() }))
    .mutation(async ({ input }) => {
      const { gameId, playerGoingFirst } = input;

      return startGame(gameId, playerGoingFirst);
    }),

  lobbyReady: authenticatedProcedure
    .input(z.object({ gameId: z.string(), solo: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { gameId } = input;
      const playerId = ctx.session.user.uid;
      return lobbyReady(playerId, gameId);
    }),

  readyToStart: authenticatedProcedure
    .input(z.object({ gameId: z.string(), solo: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { gameId, solo } = input;
      const playerId = ctx.session.user.uid;

      await sendLog(gameId, { type: "READY_TO_START", solo }, playerId);

      const lobbyReference = adminDatabase.ref(
        `lobbies/${gameId}/players/${playerId}`,
      );

      return await lobbyReference.set(true);
    }),

  restartGame: authenticatedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;
      const gameId = input.gameId;

      return restartGame(gameId, userUID);
    }),

  backToLobby: authenticatedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { gameId } = input;
      const playerId = ctx.session.user.uid;

      return backToLobby(gameId, playerId);
    }),
});
