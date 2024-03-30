import { createTRPCRouter, playerProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { sendTRPCGame } from "~/libs/3rd-party/firebase/database/game";
import { notEmptyPredicate } from "@lorcanito/engine";

const effectInput = z.object({
  gameId: z.string(),
  layerId: z.string(),
  params: z
    .object({
      targets: z.array(z.string()).optional(),
      player: z.string().optional(),
      scry: z
        .object({
          top: z.array(z.string()).optional(),
          bottom: z.array(z.string()).optional(),
          hand: z.array(z.string()).optional(),
          shouldReveal: z.boolean().optional(),
          limits: z
            .object({
              top: z.number().optional(),
              bottom: z.number().optional(),
              hand: z.number().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export const effectsRouter = createTRPCRouter({
  resolveTopOfTheStack: playerProcedure
    .input(effectInput)
    .mutation(async ({ ctx, input }) => {
      const { store } = ctx;
      const { layerId, params } = input;

      const layer = store.stackLayerStore.getLayer(layerId);
      const topOfStack = store.stackLayerStore.getTopLayer();

      if (layer && topOfStack?.id === layer?.id) {
        const { player, targets, scry } = params || {};

        if (scry) {
          store.stackLayerStore.resolveLayerById(layer.id, {
            scry: {
              top: scry.top
                ?.map((target) => store.cardStore.getCard(target))
                .filter(notEmptyPredicate),
              bottom: scry.bottom
                ?.map((target) => store.cardStore.getCard(target))
                .filter(notEmptyPredicate),
              hand: scry.hand
                ?.map((target) => store.cardStore.getCard(target))
                .filter(notEmptyPredicate),
              shouldRevealTutored: scry.shouldReveal,
              limits: scry.limits,
              tutorFilters: [],
            },
          });
        } else if (targets) {
          store.stackLayerStore.resolveLayerById(layer.id, {
            targets: targets
              ?.map((target) => store.cardStore.getCard(target))
              .filter(notEmptyPredicate),
          });
        } else if (player) {
          store.stackLayerStore.resolveLayerById(layer.id, {
            player,
          });
        } else {
          store.stackLayerStore.resolveLayerById(layer.id);
        }
      } else {
        console.log({
          topOfStack,
          layer,
        });
        store.sendNotification({
          type: "icon",
          title: `The layer being skipped is not the top of the stack`,
          message: `The layer being skipped is not the top of the stack`,
          icon: "warning",
          autoClear: true,
        });
      }

      return sendTRPCGame(store);
    }),
  skipTopOfTheStack: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        layerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store } = ctx;
      const { layerId } = input;

      const pendingLayers = store.tableStore.getPendingEffects();
      const topOfStack = pendingLayers[pendingLayers.length - 1];

      if (topOfStack?.id === layerId) {
        topOfStack.skipEffect();
      } else {
        throw new Error("Not top of the stack");
      }

      return sendTRPCGame(store);
    }),
  activate: playerProcedure
    .input(
      z.object({
        gameId: z.string(),
        instanceId: z.string(),
        ability: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { store } = ctx;
      const { instanceId, ability } = input;

      store.cardStore.getCard(instanceId)?.activate(ability);

      return sendTRPCGame(store);
    }),
});
