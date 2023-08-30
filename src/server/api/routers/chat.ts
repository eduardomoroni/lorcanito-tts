import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { StreamChat } from "stream-chat";
import { sendLog } from "~/server/serverGameLogger";

import { InternalLogEntry } from "~/spaces/Log/game-log/types";

const api_key = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

export async function createStreamClientToken(userUID: string) {
  const serverClient = StreamChat.getInstance(api_key || "", api_secret);
  return serverClient.createToken(userUID);
}

export const chatRouter = createTRPCRouter({
  // TODO: I could also move this to our JWT token
  getToken: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }): Promise<string> => {
      const userUID = ctx.session.user.uid;
      return createStreamClientToken(userUID);
    }),
  sendLogs: protectedProcedure
    .input(
      z.object({ gameId: z.string(), entry: z.object({ type: z.string() }) })
    )
    .query(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;

      // TODO: check wheetheere play is in the game

      await sendLog(input.gameId, input.entry as InternalLogEntry, userUID);
    }),
});
