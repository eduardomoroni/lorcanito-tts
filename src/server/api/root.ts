import { createTRPCRouter } from "~/server/api/trpc";
import { gameRouter } from "~/server/api/routers/joinGame";
import { settingsRouter } from "~/server/api/routers/settings";
import { chatRouter } from "~/server/api/routers/chat";
import { movesRouter } from "~/server/api/routers/moves";
import { effectsRouter } from "~/server/api/routers/effects";
import { manualMovesRouter } from "~/server/api/routers/manualMoves";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  game: gameRouter,
  settings: settingsRouter,
  chat: chatRouter,
  moves: movesRouter,
  manualMoves: manualMovesRouter,
  effects: effectsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
