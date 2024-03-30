"use client";

import { api } from "~/libs/api";
import type {
  CardModel,
  Zones,
  Game,
  ResolvingParam,
  StackLayerModel,
  TargetFilter,
  NotificationType,
} from "@lorcanito/engine";
import {
  MobXRootStore,
  MoveResponse,
  diffLogger,
  shiftAbilityPredicate,
  challengeOpponentsCardsFilter,
  shiftCharFilter,
  singASongFilter,
} from "@lorcanito/engine";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import * as Sentry from "@sentry/nextjs";

export function useGameController() {
  const trpcUtils = api.useUtils();
  const store = useGameStore();

  async function playCard(card: CardModel, params?: { bodyguard?: boolean }) {
    if (card.hasBodyguard && params?.bodyguard === undefined) {
      store.dependencies.modals.openYesOrNoModal({
        title: "Would you like to play this card exerted?",
        text: "**Bodyguard** _(This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.)_",
        onYes: () => {
          playCard(card, { bodyguard: true });
        },
        onNo: () => {
          playCard(card, { bodyguard: false });
        },
      });
    } else {
      return makeAMove(
        () => card.playFromHand(params),
        async () =>
          await trpcUtils.client.moves.playCard.mutate({
            gameId: store.id,
            instanceId: card.instanceId,
            bodyguard: params?.bodyguard,
          }),
        store,
      );
    }
  }

  async function challenge(attacker?: CardModel, defender?: CardModel) {
    if (!defender) {
      store.dependencies.modals.openTargetModal({
        type: "challenge",
        filters: challengeOpponentsCardsFilter,
        source: attacker,
        amount: 1,
        callback: (cards: CardModel[]) => {
          const target = cards[0];
          if (target) {
            challenge(attacker, target);
          }
        },
      });
    }

    if (defender && attacker) {
      return makeAMove(
        () => attacker.challenge(defender),
        () =>
          trpcUtils.client.moves.challenge.mutate({
            gameId: store.id,
            attackerId: attacker.instanceId,
            defenderId: defender.instanceId,
          }),
        store,
      );
    }
  }

  async function shift(shifter?: CardModel, target?: CardModel) {
    if (!shifter) {
      return;
    }

    if (!target) {
      const lorcanitoCard = shifter.lorcanitoCard;
      const shiftAbility = lorcanitoCard?.abilities?.find(
        shiftAbilityPredicate,
      );

      store.dependencies.modals.openTargetModal({
        title: `Choose a card to shift`,
        subtitle: shiftAbility?.text,
        source: shifter,
        filters: shiftCharFilter(shifter.lorcanitoCard),
        amount: 1,
        callback: (cards: CardModel[]) => {
          const card = cards[0];
          if (card) {
            shift(shifter, card);
          }
        },
      });
    }

    if (target && shifter) {
      return makeAMove(
        () => store.cardStore.shiftCard(shifter.instanceId, target.instanceId),
        () =>
          trpcUtils.client.moves.shift.mutate({
            gameId: store.id,
            shifter: shifter.instanceId,
            shifted: target.instanceId,
          }),
        store,
      );
    }
  }

  async function findSingTarget(song: CardModel, singer?: CardModel) {
    if (!singer) {
      const cardCost = song.lorcanitoCard.cost;
      store.dependencies.modals.openTargetModal({
        type: "sing",
        source: song,
        subtitle: `A character with cost ${cardCost} or more can ↷ to sing this song for free.`,
        filters: singASongFilter,
        callback: (cards: CardModel[]) => {
          const singer = cards[0];
          if (singer) {
            findSingTarget(song, singer);
          }
        },
      });
    }

    if (singer) {
      return makeAMove(
        () => singer.sing(song),
        async () =>
          await trpcUtils.client.moves.sing.mutate({
            gameId: store.id,
            song: song.instanceId,
            singer: singer.instanceId,
          }),
        store,
      );
    }
  }

  const resolveLayer = async (
    layer: StackLayerModel,
    params: ResolvingParam = {},
  ) => {
    const pendingLayers = store.tableStore.getPendingEffects();
    const topOfStack = pendingLayers[pendingLayers.length - 1];

    if (topOfStack?.id !== layer.id) {
      store.sendNotification({
        type: "icon",
        title: `The layer being skipped is not the top of the stack`,
        message: `The layer being skipped is not the top of the stack`,
        icon: "warning",
        autoClear: true,
      });
    }

    return makeAMove(
      () => store.stackLayerStore.resolveLayerById(layer.id, params),
      async () => {
        return trpcUtils.client.effects.resolveTopOfTheStack.mutate({
          gameId: store.id,
          layerId: layer.id,
          params: {
            player: params?.player,
            targets: params?.targets?.map((card) => card.instanceId),
            scry: params.scry
              ? {
                  ...params.scry,
                  top: params.scry?.top?.map((card) => card.instanceId),
                  bottom: params.scry?.bottom?.map((card) => card.instanceId),
                  hand: params.scry?.hand?.map((card) => card.instanceId),
                }
              : undefined,
          },
        });
      },
      store,
    );
  };
  const resolveTopLayer = async (params: ResolvingParam = {}) => {
    const pendingLayers = store.tableStore.getPendingEffects();
    const topOfStack = pendingLayers[pendingLayers.length - 1];

    if (topOfStack) {
      return resolveLayer(topOfStack, params);
    } else {
      store.sendNotification({
        type: "icon",
        title: `Layer not found`,
        message: `Layer not found`,
        icon: "warning",
        autoClear: true,
      });
    }
  };

  const passTurn = async (player: string, force?: boolean) => {
    const playerId =
      process.env.NODE_ENV === "development" ? player : store.activePlayer;

    return makeAMove(
      () => {
        const hasPendingRecklessCard = store.hasPassTurnBlockers(
          store.turnPlayer,
        );

        if (hasPendingRecklessCard && !force) {
          store.dependencies.modals.openYesOrNoModal({
            title:
              "You have a reckless card that can still challenge your opponent",
            text: "This means they MUST challenge if possible, do you want to force passing the turn? (this will skip the reckless check)",
            onYes: () => {
              passTurn(playerId, true);
            },
            onNo: () => {},
          });

          return store.sendNotification({
            type: "icon",
            title:
              "You have a reckless card that can still challenge your opponent",
            message: `You can instead use manual mode to skip this check, right click on the table and select pass turn (force)`,
            icon: "warning",
            autoClear: true,
          });
        } else {
          return store.passTurn(playerId, force);
        }
      },
      () =>
        trpcUtils.client.moves.passTurn.mutate({
          gameId: store.id,
          playerId: playerId,
          force: force,
        }),
      store,
    );
  };
  return {
    isLoading: store.isLoading,
    manualMode: store.manualMode,
    activePlayer: store.activePlayer,
    log: store.log,
    isMyTurn: store.isMyTurn,
    topCard: store.topDeckCard(store.activePlayer),
    turnPlayer: store.turnPlayer,
    hasPriority: store.hasPriority,
    gameHasStarted: store.gameHasStarted(),
    getCard: (instanceId?: string) => store.cardStore.getCard(instanceId),
    pendingLayers: store.tableStore.getPendingEffects(),

    changeMode: async (gameMode: boolean) => {
      await trpcUtils.client.settings.changeGameMode.mutate({
        gameId: store.id,
        manualMode: gameMode,
      });
      window.location.reload();
    },

    findChallengeTarget: challenge,
    findShiftTarget: shift,
    findSingTarget: findSingTarget,

    canAddCardToInkwell: (card: CardModel) => {
      if (!card?.inkwell) {
        return false;
      }

      return store.playerTable(card.ownerId)?.canAddToInkwell();
    },

    // Actual moves
    playCard: playCard,

    addToInkwell: async (card: CardModel) => {
      return makeAMove(
        () => card.addToInkwell(),
        () =>
          trpcUtils.client.moves.addToInkWell.mutate({
            gameId: store.id,
            instanceId: card.instanceId,
          }),
        store,
      );
    },

    quest: (card: CardModel) => {
      return makeAMove(
        () => card.quest(),
        () =>
          trpcUtils.client.moves.quest.mutate({
            gameId: store.id,
            instanceId: card.instanceId,
          }),
        store,
      );
    },

    questWithAll: () => {
      return makeAMove(
        () => store.questWithAll(store.activePlayer),
        () =>
          trpcUtils.client.moves.questWithAll.mutate({
            gameId: store.id,
            playerId: store.activePlayer,
          }),
        store,
      );
    },

    activate: async (card: CardModel, ability?: string) => {
      if (!card.hasActivatedAbility) {
        return;
      }

      return makeAMove(
        () => card.activate(ability),
        () =>
          trpcUtils.client.effects.activate.mutate({
            gameId: store.id,
            instanceId: card.instanceId,
            ability: ability,
          }),
        store,
      );
    },

    scry(
      top: CardModel[] = [],
      bottom: CardModel[] = [],
      hand: CardModel[] = [],
      tutorFilters: TargetFilter[] = [],
      limits?: {
        top?: number;
        bottom?: number;
        hand?: number;
      },
      shouldRevealTutored?: boolean,
    ) {
      return makeAMove(
        () =>
          store.tableStore.scry(
            top,
            bottom,
            hand,
            tutorFilters,
            limits,
            shouldRevealTutored,
          ),
        () =>
          trpcUtils.client.moves.scry.mutate({
            gameId: store.id,
            playerId: store.activePlayer,
            top: top.map((card) => card.instanceId),
            bottom: bottom.map((card) => card.instanceId),
            hand: hand.map((card) => card.instanceId),
            limits,
            shouldReveal: shouldRevealTutored,
            tutorFilters,
          }),
        store,
      );
    },

    passTurn: passTurn,

    acceptOptionalLayer: async (params: ResolvingParam = {}) => {
      return resolveTopLayer();
    },

    resolveTopLayer: resolveTopLayer,

    // TODO: Re-think about this;
    skipLayer: async (layer: StackLayerModel) => {
      return makeAMove(
        () => {
          const pendingLayers = store.tableStore.getPendingEffects();
          const topOfStack = pendingLayers[pendingLayers.length - 1];

          if (topOfStack?.id === layer.id) {
            return layer.skipEffect();
          } else {
            const notification: NotificationType = {
              type: "icon",
              title: `The layer being skipped is not the top of the stack`,
              message: `The layer being skipped is not the top of the stack`,
              icon: "warning",
              autoClear: true,
            };
            return { success: false, notifications: [notification], logs: [] };
          }
        },
        async () =>
          trpcUtils.client.effects.skipTopOfTheStack.mutate({
            gameId: store.id,
            layerId: layer.id,
          }),
        store,
      );
    },

    manualMoves: {
      tap: (
        card: CardModel,
        opts: {
          exerted?: boolean;
          toggle?: boolean;
          cardId?: string;
        },
      ) => {
        return makeAMove(
          () => store.cardStore.tapCard(card.instanceId, opts),
          () =>
            trpcUtils.client.moves.tap.mutate({
              gameId: store.id,
              instanceId: card.instanceId,
              exerted: opts.exerted,
              toggle: opts.toggle,
            }),
          store,
        );
      },

      moveCardTo: async (
        card: CardModel,
        to: Zones,
        position: "first" | "last" = "last",
      ) => {
        return makeAMove(
          () => store.tableStore.moveCard(card.instanceId, to),
          () =>
            trpcUtils.client.manualMoves.moveCard.mutate({
              gameId: store.id,
              instanceId: card.instanceId,
              to,
              position,
            }),
          store,
        );
      },

      tutorCard: async (card: CardModel) => {
        return makeAMove(
          () => store.tutorCard(card.instanceId),
          () =>
            trpcUtils.client.manualMoves.tutorCard.mutate({
              gameId: store.id,
              instanceId: card.instanceId,
            }),
          store,
        );
      },

      draw: (playerId: string) => {
        return makeAMove(
          () => store.drawCard(playerId),
          () =>
            trpcUtils.client.moves.draw.mutate({
              gameId: store.id,
              playerId: store.activePlayer,
            }),
          store,
        );
      },

      reveal: (card: CardModel) => {
        return makeAMove(
          () => store.cardStore.revealCard(card.instanceId, "deck"),
          () =>
            trpcUtils.client.moves.reveal.mutate({
              gameId: store.id,
              instanceId: card.instanceId,
            }),
          store,
        );
      },

      shuffle: () => {
        return makeAMove(
          () => store.tableStore.shuffleDeck(store.activePlayer),
          () =>
            trpcUtils.client.moves.shuffle.mutate({
              gameId: store.id,
              playerId: store.activePlayer,
            }),
          store,
        );
      },

      updateCardDamage: async (
        card: CardModel,
        amount: number,
        type: "add" | "remove" = "add",
      ) => {
        return makeAMove(
          () => {
            return card.updateCardDamage(amount, type);
          },
          () =>
            trpcUtils.client.manualMoves.updateCardDamage.mutate({
              gameId: store.id,
              instanceId: card.instanceId,
              amount,
              type,
            }),
          store,
        );
      },
    },
    updateLore(playerId: string, lore: number) {
      return makeAMove(
        () => {
          const tableModel = store.playerTable(playerId);

          if (!tableModel) {
            return store.sendNotification({
              type: "icon",
              title: `Player not found`,
              message: `Player not found`,
              icon: "warning",
              autoClear: true,
            });
          }

          return tableModel.updateLore(lore);
        },
        () =>
          trpcUtils.client.manualMoves.updateLore.mutate({
            gameId: store.id,
            playerId,
            lore,
          }),
        store,
      );
    },
  };
}

async function makeAMove(
  clientSideMove: () => MoveResponse,
  serverSideMove: () => Promise<Game>,
  store: MobXRootStore,
) {
  const beforeMove = store.toJSON();
  store.flushResponse();
  store.isLoading = true;

  try {
    const result = clientSideMove();

    if (result.success) {
      const response = await serverSideMove();
      console.log("trpc");
      diffLogger(beforeMove, response, console, false);
      // store.sync(response);
    }

    if (!result.success) {
      console.log("TRPC failed");
      console.log(result);
      store.sync(beforeMove);
    }

    // TODO: Fix this
    // if (result.notifications) {
    //   result.notifications.forEach((notification) => {
    //     store.sendNotification(notification);
    //   });
    // }
  } catch (e) {
    console.error(e);
    // THis works as an undo;
    store.sync(beforeMove);
    store.sendNotification({
      type: "icon",
      title: `Invalid move`,
      message: `${e.message}, you can use manual mode to fix game state.`,
      icon: "warning",
      autoClear: true,
    });
    Sentry.captureException(e);
  } finally {
    store.isLoading = false;
    store.flushResponse();
  }
}

export type GameController = ReturnType<typeof useGameController>;
