import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { gameRouter } from "~/server/api/routers/joinGame";
import { settingsRouter } from "~/server/api/routers/settings";
import { chatRouter } from "~/server/api/routers/chat";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  game: gameRouter,
  settings: settingsRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
