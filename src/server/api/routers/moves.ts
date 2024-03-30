import { createTRPCRouter, playerProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { sendTRPCGame } from "~/libs/3rd-party/firebase/database/game";
import { Zones } from "@lorcanito/engine";

const cardInput = z.object({
  gameId: z.string(),
  instanceId: z.string(),
});

const playerInput = z.object({
  gameId: z.string(),
  playerId: z.string(),
});

export const movesRouter = createTRPCRouter({
  challenge: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        attackerId: z.string(),
        defenderId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { defenderId, attackerId } = input;

      store.cardStore.challenge(attackerId, defenderId);

      return sendTRPCGame(store);
    }),
  shift: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        shifter: z.string(),
        shifted: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { shifter, shifted } = input;

      store.cardStore.shiftCard(shifter, shifted);

      return sendTRPCGame(store);
    }),
  sing: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        singer: z.string(),
        song: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { singer, song } = input;

      store.sing(song, singer);

      return sendTRPCGame(store);
    }),
  alterHand: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        cardsToMulligan: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { cardsToMulligan } = input;

      await store.alterHand(cardsToMulligan, session.user.uid);

      return sendTRPCGame(store);
    }),
  addToInkWell: playerProcedure
    .input(cardInput)
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { instanceId } = input;

      store.addToInkwell(instanceId);

      return sendTRPCGame(store);
    }),
  playCard: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        instanceId: z.string(),
        bodyguard: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { instanceId, bodyguard } = input;

      store.playCardFromHand(instanceId, { bodyguard: bodyguard });

      return sendTRPCGame(store);
    }),
  quest: playerProcedure.input(cardInput).mutation(async ({ ctx, input }) => {
    const { store, session } = ctx;
    const { instanceId } = input;

    store.cardStore.quest(instanceId);

    return sendTRPCGame(store);
  }),
  questWithAll: playerProcedure
    .input(playerInput)
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { playerId } = input;

      store.questWithAll(playerId);

      return sendTRPCGame(store);
    }),
  tap: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        instanceId: z.string(),
        exerted: z.boolean().optional(),
        toggle: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { instanceId, exerted, toggle } = input;

      store.cardStore.tapCard(instanceId, { exerted, toggle });

      return sendTRPCGame(store);
    }),
  moveTo: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        instanceId: z.string(),
        to: z.enum(["inkwell", "hand", "deck", "discard", "play"]),
        position: z.enum(["first", "last"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { instanceId, to, position } = input;

      // TODO: I'm not sure why this is erroring out
      store.tableStore.moveCard(instanceId, to as Zones, {
        position: position as "first" | "last",
      });

      return sendTRPCGame(store);
    }),
  scry: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        playerId: z.string(),
        top: z.array(z.string()),
        bottom: z.array(z.string()),
        hand: z.array(z.string()),
        shouldReveal: z.boolean().optional(),
        tutorFilters: z.array(z.unknown()).optional(),
        limits: z
          .object({
            top: z.number().optional(),
            bottom: z.number().optional(),
            hand: z.number().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const {
        playerId,
        top,
        bottom,
        hand,
        limits,
        tutorFilters,
        shouldReveal,
      } = input;

      store.scry(
        playerId,
        top,
        bottom,
        hand,
        // @ts-ignore TODO: fix this type
        tutorFilters,
        limits,
        shouldReveal,
      );

      return sendTRPCGame(store);
    }),
  draw: playerProcedure.input(playerInput).mutation(async ({ ctx, input }) => {
    const { store, session } = ctx;
    const { playerId } = input;

    store.drawCard(playerId);

    return sendTRPCGame(store);
  }),
  reveal: playerProcedure.input(cardInput).mutation(async ({ ctx, input }) => {
    const { store, session } = ctx;
    const { instanceId } = input;

    store.cardStore.revealCard(instanceId, "deck");

    return sendTRPCGame(store);
  }),
  shuffle: playerProcedure
    .input(playerInput)
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { playerId } = input;

      store.tableStore.shuffleDeck(playerId);

      return sendTRPCGame(store);
    }),
  undoTurn: playerProcedure.input(playerInput).mutation(async ({ ctx }) => {
    const { store, session } = ctx;
    store.undoTurn();
    return sendTRPCGame(store);
  }),
  passTurn: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        playerId: z.string(),
        force: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store, session } = ctx;
      const { playerId, force } = input;

      store.passTurn(playerId, force);
      const game = store.toJSON();
      const gameWithoutUndo = { ...game, undoState: undefined };

      await sendTRPCGame(store, JSON.stringify(gameWithoutUndo));
      return gameWithoutUndo;
    }),
});
