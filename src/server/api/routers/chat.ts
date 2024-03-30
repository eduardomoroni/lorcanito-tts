import { createTRPCRouter, authenticatedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { StreamChat } from "stream-chat";
import { sendLog, updateStreamUser } from "~/server/serverGameLogger";

import type { InternalLogEntry } from "@lorcanito/engine";

const api_key = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

export async function createStreamClientToken(userUID: string) {
  await updateStreamUser(userUID);
  const serverClient = StreamChat.getInstance(api_key || "", api_secret);
  return serverClient.createToken(userUID);
}

export const chatRouter = createTRPCRouter({
  // TODO: I could also move this to our JWT token
  getToken: authenticatedProcedure
    .input(z.object({}))
    .query(async ({ ctx }): Promise<string> => {
      const userUID = ctx.session.user.uid;
      return createStreamClientToken(userUID);
    }),
  sendLogs: authenticatedProcedure
    .input(
      z.object({ gameId: z.string(), entry: z.object({ type: z.string() }) }),
    )
    .query(async ({ ctx, input }) => {
      const userUID = ctx.session.user.uid;

      // TODO: check wheetheere play is in the game

      await sendLog(input.gameId, input.entry as InternalLogEntry, userUID);
    }),
});
