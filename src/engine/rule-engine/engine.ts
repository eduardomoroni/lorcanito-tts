import type { Game } from "~/libs/game";
import { rootReducer } from "~/engine/redux/reducer";
import { configureStore, type Middleware } from "@reduxjs/toolkit";
import {
  addToInkwell,
  alterHand,
  challenge,
  passTurn,
  payInkCostForCard,
  playCardFromHand,
  quest,
  revealCard,
  moveCard,
  setPlayerLore,
  shift,
  shuffleDeck,
  singCard,
  tapCard,
  updateCardDamage,
  payInkCost,
  resolveEffect,
  shuffleCardIntoDeck,
  canPayInkCostForCard,
  canPayInkCost,
  scry,
} from "~/engine/redux/reducer/gameReducer";
import { listenerMiddleware } from "~/engine/redux/middleware/listenerMiddleware";
import {
  GameContext,
  initialState as contextInitialState,
} from "~/engine/redux/reducer/contextReducer";
import type { Zones } from "~/providers/TabletopProvider";
import { TargetFilter } from "~/components/modals/target/filters";
import { applyAllCardFilters } from "~/components/modals/target/filterPredicates";
import {
  selectBottomDeckCard,
  selectCardMeta,
  selectCardOwner,
  selectPlayerLore,
  selectPlayerZone,
  selectShiftCost,
  selectSingCost,
  selectTableCard,
  selectTopDeckCard,
  selectTurnPlayer,
} from "~/engine/rule-engine/lorcana/selectors";
import { allCardsById } from "~/engine/cards";
import { RootState } from "~/engine/redux";
import {
  createLogEntry,
  useGameLogger,
} from "~/spaces/Log/game-log/GameLogProvider";
import { useNotification } from "~/providers/NotificationProvider";
import { useYesOrNoModal } from "~/providers/YesOrNoModalProvider";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { bodyguardAbilityPredicate, LorcanitoCard } from "~/engine/cardTypes";

export type AdditionalArgs = {
  logger: ReturnType<typeof useGameLogger>;
  notifier: ReturnType<typeof useNotification>;
  playerId: string;
  modals: {
    openYesOrNoModal: ReturnType<typeof useYesOrNoModal>;
  };
};

const fallbackArgs: AdditionalArgs = {
  logger: {
    log: () => {},
  },
  notifier: {
    sendNotification: () => {},
    clearAllNotifications: () => {},
    clearNotification: () => {},
  },
  modals: {
    openYesOrNoModal: () => {},
  },
  playerId: "",
};

export function createRuleEngine(
  initialState: Game,
  middleware: Middleware[] = [],
  args: AdditionalArgs = fallbackArgs
) {
  const {
    notifier: { sendNotification },
    logger,
    modals,
    playerId,
  } = args;
  const playerOrder = Object.keys(initialState.tables || {});
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      game: initialState,
      context: {
        ...contextInitialState,
        playerOrder,
        activePlayer: playerOrder[0],
      },
    },
    // Add the listener middleware to the store.
    // NOTE: Since this can receive actions with functions inside,
    // it should go before the serializability check middleware
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        listenerMiddleware.middleware,
        ...middleware
      ),
  });

  function bySelector<T>(selector: (state: RootState) => T): T {
    return selector(store.getState());
  }

  const engine = {
    store,
    getState: (): Game => {
      const state: { game: Game } = store.getState();
      return state.game;
    },
    getContext: (): GameContext => {
      const state: { context: GameContext } = store.getState();
      return state.context;
    },
    get: {
      // Used mostly in tests
      byZoneAndId: (params: {
        zone: Zones;
        lorcanitoId: string;
        owner: string;
      }) => {
        const { zone, lorcanitoId, owner } = params;
        const cardsInZone = engine.get.zoneCards(zone, owner);
        // TODO: do something when it's not found
        return cardsInZone.find(
          (instanceId: string) =>
            lorcanitoId === engine.get.lorcanitoCard(instanceId)?.id
        ) as string;
      },
      bySelector: bySelector,
      turnPlayer: () => {
        return engine.getState().turnPlayer;
      },
      activePlayer: () => {
        return engine.getState().turnPlayer;
      },
      effect: (effectId: string) => {
        return engine
          .getState()
          .effects.find((effect) => effect.id === effectId);
      },
      effects: () => {
        return engine.getState().effects || [];
      },
      topDeckCard: (playerId: string) =>
        selectTopDeckCard(engine.getState(), playerId),
      bottomDeckCard: (playerId: string) =>
        selectBottomDeckCard(engine.getState(), playerId),
      cardOwner: (instanceId: string) => {
        return selectCardOwner(engine.getState(), instanceId);
      },
      cardMeta: (instanceId: string) => {
        return selectCardMeta(engine.getState(), instanceId);
      },
      shiftCost: (instanceId: string): number => {
        return selectShiftCost(engine.getState(), instanceId);
      },
      tableCard: (instanceId?: string) => {
        return selectTableCard(engine.getState(), instanceId);
      },
      lorcanitoCard: (instanceId?: string): LorcanitoCard | undefined => {
        const cardId = selectTableCard(engine.getState(), instanceId)?.cardId;
        return cardId ? allCardsById[cardId] : undefined;
      },
      zoneCards(zone: Zones, playerId: string) {
        return selectPlayerZone(engine.getState(), playerId, zone);
      },
      zoneTableCards(zone: Zones, playerId: string) {
        return selectPlayerZone(engine.getState(), playerId, zone).map((card) =>
          engine.get.tableCard(card)
        );
      },
      allTableCards() {
        return Object.values(engine.getState().cards || {});
      },
      players() {
        return Object.keys(engine.getState().tables || {}) || [];
      },
      byFilter(filters: TargetFilter[]) {
        const allTableCards = this.allTableCards();

        return allTableCards.filter(
          applyAllCardFilters(filters, engine, engine.get.activePlayer())
        );
      },
    },
    moves: {
      resolveEffect: (
        effectId: string,
        params?: {
          targetId?: string;
        }
      ) => {
        const effect = engine.get.effect(effectId);
        const targetId = params?.targetId;

        if (!effect) {
          console.error("Effect not found", effectId);
          return;
        }

        if (targetId) {
          logger.log({ type: "RESOLVE_EFFECT", effect, targetId });
          logAnalyticsEvent("resolve_effect");
        } else {
          logAnalyticsEvent("skip_resolve_effect");
        }

        if (effect.ability.effect === "shuffle" && targetId) {
          engine.moves.shuffleCardIntoDeck({
            instanceId: targetId,
            from: "discard",
          });
          logger.log({ type: "SHUFFLE_CARD", instanceId: targetId });
          logAnalyticsEvent("shuffle_card");
        }

        store.dispatch(resolveEffect({ effectId }));
      },
      drawCard(player: string) {
        const topCard = engine.get.topDeckCard(player);
        engine.moves?.moveCard(topCard, "deck", "hand", "last");
        logAnalyticsEvent("draw_card");
      },
      alterHand: (cards: string[], player: string) => {
        store.dispatch(alterHand({ cardsToAlter: cards, playerId: player }));

        logger.log(
          createLogEntry(
            {
              type: "MULLIGAN",
              cards: cards,
              player: player,
            },
            playerId
          )
        );
        logAnalyticsEvent("mulligan", { cards: cards.length });
      },
      shuffleDeck: (player: string) => {
        store.dispatch(shuffleDeck({ playerId: player }));
        logger.log({ type: "SHUFFLE_DECK" });
        logAnalyticsEvent("shuffle_deck");
      },
      shuffleCardIntoDeck: (params: { instanceId: string; from: Zones }) => {
        store.dispatch(shuffleCardIntoDeck(params));
      },
      setPlayerLore: (player: string, lore: number) => {
        const playerLore = selectPlayerLore(engine.getState(), player);

        store.dispatch(setPlayerLore({ playerId: player, lore }));

        logger.log({
          type: "LORE_CHANGE",
          player: player,
          from: playerLore,
          to: lore,
        });
        logAnalyticsEvent("lore_change");
      },
      payInkCostForCard: (instanceId: string) => {
        store.dispatch(payInkCostForCard({ instanceId }));
      },
      payInkCost: (cost: number, owner: string) => {
        store.dispatch(payInkCost({ cost, owner }));
      },
      moveCard: (
        instanceId = "",
        from: Zones,
        to: Zones,
        position: "first" | "last" = "last"
      ) => {
        store.dispatch(moveCard({ instanceId, from, to, position }));
        const owner = engine.get.cardOwner(instanceId);
        logger.log(
          createLogEntry(
            {
              type: "MOVE_CARD",
              instanceId,
              from,
              to,
              position,
              owner,
            },
            owner
          )
        );
        logAnalyticsEvent("move_card", { from, to });
      },
      passTurn: (player: string) => {
        store.dispatch(passTurn({ playerId: player }));
        const nextPlayer = selectTurnPlayer(engine.getState());
        logger.log({ type: "PASS_TURN", player: playerId });
        logAnalyticsEvent("pass_turn");
        engine.moves.drawCard(nextPlayer);
      },
      addToInkwell: (instanceId: string) => {
        const owner = engine.get.cardOwner(instanceId);
        const inkwell = engine.get.zoneTableCards("inkwell", owner);
        const hasPlayedThisTurn = inkwell.find((card) => {
          return card?.meta?.playedThisTurn;
        });
        const lorcanitoCard = engine.get.lorcanitoCard(instanceId);

        if (!lorcanitoCard?.inkwell) {
          sendNotification({
            type: "icon",
            title: "This card doesn't contain inkwell symbol",
            message: `You can instead right click the card and select "Move card to Inkwell" option, if you want to skip this check.`,
            icon: "warning",
            autoClear: true,
          });
        } else if (hasPlayedThisTurn) {
          sendNotification({
            type: "icon",
            title: "You already added a card to the inkwell this turn",
            message: `You can instead right click the card and select "Move card to Inkwell" option, if you want to skip this check.`,
            icon: "warning",
            autoClear: true,
          });
        } else {
          store.dispatch(addToInkwell({ instanceId }));

          logger.log({
            type: "MOVE_CARD",
            instanceId,
            from: "hand",
            to: "inkwell",
            owner: owner,
          });
        }
      },
      playCardFromHand: (
        instanceId?: string,
        params?: { bodyguard?: boolean }
      ) => {
        if (!instanceId) {
          console.log("No instanceId");
          return;
        }

        const lorcanitoCard = engine.get.lorcanitoCard(instanceId);
        const hasBodyGuard = lorcanitoCard?.abilities?.find(
          bodyguardAbilityPredicate
        );
        if (hasBodyGuard && params?.bodyguard === undefined) {
          console.log("bodyguard");
          modals.openYesOrNoModal({
            title: "Would you like to play this card exerted?",
            text: "**Bodyguard** _(This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.)_",
            onYes: () => {
              engine.moves.playCardFromHand(instanceId, { bodyguard: true });
            },
            onNo: () => {
              engine.moves.playCardFromHand(instanceId, { bodyguard: false });
            },
          });

          return;
        }

        const payed = canPayInkCostForCard(engine.getState(), instanceId);
        if (payed) {
          store.dispatch(playCardFromHand({ instanceId, params }));

          logger.log({
            type: "MOVE_CARD",
            instanceId,
            from: "hand",
            to: "play",
            owner: engine.get.cardOwner(instanceId),
          });

          // const card = engine.get.lorcanitoCard(instanceId);
          // const resolutionAbilities = card?.abilities?.filter(
          //   resolutionAbilityPredicate
          // );

          // if (resolutionAbilities) {
          //   logger.log({
          //     type: "RESOLVING_ABILITIES",
          //     abilities: resolutionAbilities,
          //   });
          // }
        } else {
          sendNotification({
            type: "icon",
            title: "Not enough ink",
            message: `If you think this is a mistake, right click the card and select "Move to Play Area"`,
            icon: "warning",
            autoClear: true,
          });
        }
      },
      quest: (instanceId: string) => {
        store.dispatch(quest({ instanceId }));

        const card = engine.get.lorcanitoCard(instanceId);
        logger.log({
          type: "QUEST",
          instanceId,
          cardId: card?.id,
          amount: card?.lore || 0,
        });
        logAnalyticsEvent("quest", { instanceId });
      },
      tapCard: (
        instanceId: string = "",
        opts: {
          exerted?: boolean;
          toggle?: boolean;
          cardId?: string;
          inkwell?: boolean;
        }
      ) => {
        if (instanceId) {
          const { exerted, inkwell, toggle, cardId } = opts;
          store.dispatch(tapCard({ instanceId, opts }));

          const meta = engine.get.cardMeta(instanceId);
          logger.log({
            type: "TAP",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            value: meta?.exerted || false,
            instanceId,

            inkwell: false,
          });
          logAnalyticsEvent("tap_card", { instanceId, exerted, inkwell });
        }
      },
      revealCard: (instanceId: string = "", from: Zones) => {
        if (instanceId) {
          store.dispatch(revealCard({ instanceId }));

          logger.log({
            type: "REVEAL_CARD",
            card: instanceId,
            from,
            player: playerId,
          });
          logAnalyticsEvent("reveal_card");
        }
      },
      updateCardDamage: (
        instanceId = "",
        amount: number,
        type: "add" | "remove" = "add"
      ) => {
        const card = engine.getState().cards[instanceId];
        const cardDamageCounter = card?.meta?.damage || 0;
        const damage =
          type === "add"
            ? cardDamageCounter + amount
            : cardDamageCounter - amount;

        store.dispatch(updateCardDamage({ instanceId, amount, type }));

        logger.log({
          type: "DAMAGE_CHANGE",
          instanceId,
          to: damage,
          from: cardDamageCounter,
        });
        logAnalyticsEvent("damage_change", { instanceId, amount, type });
      },
      singCard: (songId?: string, singerId?: string) => {
        if (songId && singerId) {
          const song = engine.get.lorcanitoCard(songId);
          const singer = engine.get.lorcanitoCard(singerId);
          const singerCostReduction: number =
            selectSingCost(engine.getState(), singerId) || singer?.cost || 0;

          const songCost = song?.cost || 0;
          if (songCost > singerCostReduction) {
            sendNotification({
              type: "icon",
              title: "Not enough ink",
              message: `You can instead right click the card and select "Play Card" option and then exert the singer, if you want to skip this check.`,
              icon: "warning",
              autoClear: true,
            });
          }

          store.dispatch(singCard({ songId, singerId }));

          logger.log({ type: "SING", song: songId, singer: singerId });
        }
      },
      challenge: (attackerId?: string, defenderId?: string) => {
        if (attackerId && defenderId) {
          store.dispatch(challenge({ attackerId, defenderId }));

          logger.log(
            createLogEntry(
              {
                type: "CHALLENGE",
                attacker: attackerId,
                defender: defenderId,
              },
              playerId
            )
          );
          logAnalyticsEvent("challenge", { attackerId, defenderId });
        }
      },
      scry: (top: string[], bottom: string[]) => {
        store.dispatch(scry({ top, bottom }));
        logger.log({
          type: "SCRY",
          top: top.length,
          bottom: bottom.length,
        });
        logAnalyticsEvent("scry");
      },
      shift: (shifter?: string, shifted?: string) => {
        if (shifter && shifted) {
          const shifterCard = engine.get.lorcanitoCard(shifter);
          const canPay = canPayInkCost(
            engine.getState(),
            shifterCard?.cost || 0,
            playerId
          );

          if (!canPay) {
            sendNotification({
              type: "icon",
              title: "Not enough ink",
              message: `You can drag the card from hand on top of the card you want to shift, to skip paying costs.`,
              icon: "warning",
              autoClear: true,
            });
          }

          store.dispatch(shift({ shifter, shifted }));

          logger.log({ type: "SHIFT", shifter, shifted });
          logAnalyticsEvent("shift");
        }
      },
    },
  };

  return engine;
}

export type Engine = ReturnType<typeof createRuleEngine>;
