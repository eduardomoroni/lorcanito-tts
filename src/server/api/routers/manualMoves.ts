import { createTRPCRouter, playerProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { sendTRPCGame } from "~/libs/3rd-party/firebase/database/game";

const cardInput = z.object({
  gameId: z.string(),
  instanceId: z.string(),
});

const playerInput = z.object({
  gameId: z.string(),
  playerId: z.string(),
});

export const manualMovesRouter = createTRPCRouter({
  moveCard: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        instanceId: z.string(),
        to: z.enum(["hand", "play", "discard", "inkwell", "deck"]),
        position: z.enum(["first", "last"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { instanceId, to, position } = input;

      store.tableStore.moveCard(instanceId, to, { position });

      return sendTRPCGame(store);
    }),
  updateCardDamage: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        instanceId: z.string(),
        amount: z.number(),
        type: z.enum(["add", "remove"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { instanceId, amount, type } = input;

      store.cardStore.getCard(instanceId)?.updateCardDamage(amount, type);

      return sendTRPCGame(store);
    }),

  tutorCard: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        instanceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { instanceId } = input;

      store.tutorCard(instanceId);

      return sendTRPCGame(store);
    }),

  updateLore: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        playerId: z.string(),
        lore: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store } = ctx;
      const { playerId, lore } = input;
      store.playerTable(playerId)?.updateLore(lore);
      return sendTRPCGame(store);
    }),
});
