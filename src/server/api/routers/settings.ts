import {
  createTRPCRouter,
  authenticatedProcedure,
  playerProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { adminDatabase } from "~/libs/3rd-party/firebase/admin";
import { sendTRPCGame } from "~/libs/3rd-party/firebase/database/game";

export const settingsRouter = createTRPCRouter({
  loadDeck: authenticatedProcedure
    .input(z.object({ deckCode: z.string(), provider: z.string() }))
    .query(async ({ input }): Promise<string[]> => {
      const response = await fetch(
        `http://localhost:3000/api/${input.provider}/deck/${input.deckCode}`,
      );

      return response.json();
    }),

  bugReport: authenticatedProcedure
    .input(
      z.object({
        whatHappened: z.string().optional(),
        expected: z.string().optional(),
        reproduce: z.string().optional(),
        gameId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const gameReference = adminDatabase.ref(`games/${input.gameId}`);
      const snapshot = await gameReference.get();
      const game = await snapshot.val();
      const bugReport = adminDatabase.ref(
        `feedback/bug-report/${ctx.session.user.uid}/${Date.now()}`,
      );
      const bug = {
        game,
        gameId: input.gameId,
        whatHappened: input.whatHappened || "",
        expected: input.expected || "",
        reproduce: input.reproduce || "",
        timestamp: new Date().toLocaleString(),
      };
      console.log("Reporting bug");
      console.log(JSON.stringify(bug, null, 2));
      await bugReport.set(bug);
    }),

  changeGameMode: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        manualMode: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { manualMode } = input;

      store.setManualMode(manualMode);

      return sendTRPCGame(store);
    }),
});
