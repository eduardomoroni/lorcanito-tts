import { makeAutoObservable, toJS } from "mobx";

import { TableStore } from "@lorcanito/engine/store/TableStore";
import { Dependencies } from "@lorcanito/engine/store/types";
import { CardStore } from "@lorcanito/engine/store/CardStore";
import { StackLayerStore } from "@lorcanito/engine/store/StackLayerStore";
import { StaticTriggeredStore } from "@lorcanito/engine/store/StaticTriggeredStore";
import { ContinuousEffectStore } from "@lorcanito/engine/store/ContinuousEffectStore";
import { ConfigurationStore } from "@lorcanito/engine/store/ConfigurationStore";
import { EffectStore } from "@lorcanito/engine/store/EffectStore";
import { notEmptyPredicate } from "@lorcanito/engine/rules/abilities/abilityTypeGuards";
import type { LogEntry } from "@lorcanito/engine/types/Log";
import type { Meta, Zones, Game } from "@lorcanito/engine/types";
import type { NotificationType } from "@lorcanito/engine/types/Notification";

import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";
import { Condition } from "@lorcanito/engine/rules/abilities/abilities";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";

export type MoveResponse = {
  success: boolean;
  notifications?: NotificationType[];
  logs?: LogEntry[];
};
export function recursivelyNullifyUndefinedValues<T>(obj: unknown = {}) {
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (!!value && typeof value === "object") {
      if (key === "rootStore") {
        return;
      }

      recursivelyNullifyUndefinedValues(value);
    } else if (value === undefined) {
      // @ts-ignore
      obj[key] = null;
    }
  });

  return obj as T;
}

function selectNextTurnPlayer(players: string[], playerId: string) {
  const next = (players.findIndex((p) => p === playerId) + 1) % players.length;

  return players[next] || playerId;
}

export class MobXRootStore {
  dependencies: Dependencies;
  id: string;
  lastActionId: number;
  lastActivity?: number;
  visibility: "public" | "private";
  turnPlayer: string;
  priorityPlayer: string;
  turnCount: number;
  mode: "solo" | "multiplayer";
  manualMode?: boolean;
  // hash: string;
  seed: string;
  undoState?: string;

  readonly activePlayer: string;
  readonly opponent: string;

  private _winner?: string | null;
  private _isLoading: boolean = false;

  private _moveResponse?: MoveResponse;
  private _pendingLogs: LogEntry[] = [];
  private _pendingNotifications: NotificationType[] = [];

  // TODO: figure out how ot get rid of this
  players: Record<string, boolean>;

  // stores
  tableStore: TableStore;
  cardStore: CardStore;
  stackLayerStore: StackLayerStore;
  triggeredStore: StaticTriggeredStore;
  continuousEffectStore: ContinuousEffectStore;
  configurationStore: ConfigurationStore;
  effectStore: EffectStore;

  constructor(
    initialState: Game,
    dependencies: Dependencies,
    observable = true,
  ) {
    if (observable) {
      makeAutoObservable(this, { dependencies: false });
    }

    this.dependencies = dependencies;

    this.activePlayer = this.dependencies.playerId;
    this.opponent =
      Object.keys(initialState.tables).filter(
        (player) => player !== this.activePlayer,
      )[0] || "SOLO_MODE";

    // state
    this.id = initialState.id;
    this.lastActionId = initialState.lastActionId;
    this.lastActivity = initialState.lastActivity;
    this.visibility = initialState.visibility;
    this.priorityPlayer = initialState.priorityPlayer;
    this.turnPlayer = initialState.turnPlayer;
    this.turnCount = initialState.turnCount;
    this.mode = initialState.mode;
    this.players = initialState.players;
    this.manualMode = initialState.manualMode;
    this.seed = initialState.seed;
    this._winner = initialState.winner;
    if (!observable) {
      this.undoState = initialState.undoState;
    }

    // stores
    this.cardStore = new CardStore(
      initialState.cards,
      dependencies,
      this,
      observable,
    );

    this.tableStore = TableStore.fromTable(
      initialState.tables,
      dependencies,
      this.cardStore,
      this,
      observable,
    );
    this.stackLayerStore = new StackLayerStore(
      initialState.effects,
      dependencies,
      this,
      observable,
    );
    this.triggeredStore = new StaticTriggeredStore(this, observable);
    this.continuousEffectStore = new ContinuousEffectStore(
      initialState.continuousEffects,
      this,
      observable,
    );
    this.configurationStore = new ConfigurationStore(observable);
    this.effectStore = new EffectStore(this, observable);
  }

  sync(game: Game) {
    this.id = game.id;
    this.lastActionId = game.lastActionId;
    this.lastActivity = game.lastActivity;
    this.visibility = game.visibility;
    this.priorityPlayer = game.priorityPlayer;
    this.turnPlayer = game.turnPlayer;
    this.turnCount = game.turnCount;
    this.mode = game.mode;
    this.players = game.players;
    this.manualMode = game.manualMode;
    this.seed = game.seed;
    this._winner = game.winner;
    // this.undoState = game.undoState;

    this.cardStore.sync(game.cards);
    this.tableStore.sync(game.tables);
    this.stackLayerStore.sync(game.effects);
    this.continuousEffectStore.sync(game.continuousEffects);
    this.triggeredStore.sync(game.triggeredAbilities);

    return this;
  }

  // This converts the observables into plain objects
  toJSON(): Game {
    const game = toJS({
      id: this.id,
      lastActionId: this.lastActionId,
      lastActivity: this.lastActivity,
      visibility: this.visibility,
      priorityPlayer: this.priorityPlayer,
      turnPlayer: this.turnPlayer,
      turnCount: this.turnCount,
      mode: this.mode,
      manualMode: this.manualMode,
      players: this.players,
      tables: this.tableStore.toJSON(),
      cards: this.cardStore.toJSON(),
      effects: this.stackLayerStore.toJSON(),
      continuousEffects: this.continuousEffectStore.toJSON(),
      triggeredAbilities: this.triggeredStore.toJSON(),
      seed: this.seed,
      winner: this._winner,
      undoState: this.undoState,
    });

    return recursivelyNullifyUndefinedValues(game);
  }

  moveResponse(success: boolean = true): MoveResponse {
    const moveResponse = this._moveResponse || {
      success: true,
      logs: [],
      notifications: [],
    };
    this._moveResponse = {
      success: moveResponse.success && success,
      logs: this._pendingLogs,
      notifications: this._pendingNotifications,
    };

    return this._moveResponse;
  }

  setUndoState(state: string) {
    this.undoState = state;
  }

  flushResponse() {
    const response = this._moveResponse;
    this._moveResponse = undefined;
    this._pendingLogs = [];
    this._pendingNotifications = [];
    return response;
  }

  get winner() {
    if (this._winner) {
      return this._winner;
    }

    const players = Object.values(this.tableStore.tables);
    return players.find((player) => player.lore >= 20)?.ownerId;
  }

  get hasPriority() {
    if (this.manualMode) {
      return true;
    }

    return this.priorityPlayer === this.dependencies.playerId;
  }

  getActiveEffects() {
    return this.continuousEffectStore.continuousEffects;
  }

  questWithAll(playerId: string): MoveResponse {
    if (playerId !== this.activePlayer) {
      return this.sendNotification({
        type: "icon",
        icon: "error",
        title: "You can only quest your own cards",
        message: "",
        autoClear: true,
      });
    }

    this.tableStore?.getTable(playerId)?.zones?.play?.cards.forEach((card) => {
      if (
        !card.hasQuestRestriction &&
        !card.meta.playedThisTurn &&
        card.ready
      ) {
        card.quest();
      }
    });

    return this.moveResponse(true);
  }
  gameHasStarted() {
    return Object.values(this.tableStore.tables).every(
      (table) => table.readyToStart,
    );
  }

  playerTable(playerId: string) {
    return this.tableStore.tables[playerId];
  }

  tableCard(instanceId: string) {
    return this.cardStore.cards[instanceId];
  }

  getPlayerZone(playerId: string, zone: Zones) {
    return this.tableStore.getPlayerZone(playerId, zone);
  }

  topDeckCard(playerId: string) {
    return this.tableStore.getTopDeckCard(playerId);
  }

  setManualMode(mode: boolean) {
    this.manualMode = mode;

    this.log({
      type: "MANUAL_MODE",
      sender: this.activePlayer,
      toggle: mode,
    });
  }

  bottomDeckCard(playerId: string) {
    return this.tableStore.getBottomDeckCard(playerId);
  }

  opponentPlayer(playerId: string) {
    if (playerId === this.activePlayer) {
      return this.opponent;
    }

    if (playerId === this.opponent) {
      return this.activePlayer;
    }

    return "NO_OPPONENT_FOUND";
  }

  get isMyTurn() {
    return this.turnPlayer === this.dependencies.playerId;
  }

  drawCard(
    playerId: string,
    amount: number = 1,
    skipLog = false,
  ): MoveResponse {
    return this.tableStore.drawCards(playerId, amount, skipLog);
  }

  hasPassTurnBlockers(currentPlayer: string) {
    const opponent = this.opponentPlayer(currentPlayer);
    const playArea = this.playerTable(currentPlayer)?.zones?.play?.cards || [];
    const opponentPlayArea =
      this.playerTable(opponent)?.zones?.play?.cards || [];

    return playArea
      ?.filter((card) => card.hasReckless)
      .some((recklessGlimmer) => {
        return opponentPlayArea.some((opponentCard) =>
          recklessGlimmer.canChallenge(opponentCard),
        );
      });
  }

  passTurn(playerId: string, force: boolean = false): MoveResponse {
    if (this.stackLayerStore.getTopLayer()) {
      return this.sendNotification({
        type: "icon",
        title: "There's still effects to be resolved",
        message: `Please make sure all effects are resolved/skipped before passing the turn`,
        icon: "warning",
        autoClear: true,
      });
    }

    const nextTurnPlayer = selectNextTurnPlayer(
      Object.keys(this.tableStore.tables) as string[],
      this.turnPlayer,
    );

    const currentPlayerTable = this.tableStore.getTable(this.turnPlayer);
    const nextTurnPlayerTable = this.tableStore.getTable(nextTurnPlayer);

    const hasPendingRecklessCard = this.hasPassTurnBlockers(this.turnPlayer);

    if (hasPendingRecklessCard && !force) {
      return this.sendNotification({
        type: "icon",
        title:
          "You have a reckless card that can still challenge your opponent",
        message: `You can instead use manual mode to skip this check, right click on the table and select pass turn (force)`,
        icon: "warning",
        autoClear: true,
      });
    }

    this.log({ type: "PASS_TURN", player: playerId, turn: this.turnCount });

    this.triggeredStore.onEndOfTurn(this.turnPlayer);

    nextTurnPlayerTable.resetTurn();
    currentPlayerTable.resetTurn();

    this.turnCount++;
    this.turnPlayer = nextTurnPlayer;
    this.priorityPlayer = nextTurnPlayer;

    this.continuousEffectStore.onTurnPassed(this.turnCount);
    this.triggeredStore.onTurnPassed(this.turnCount);

    return this.readySetDraw(nextTurnPlayer);
  }

  readySetDraw(playerId: string): MoveResponse {
    const zones: Zones[] = ["play", "inkwell"];
    zones.forEach((zone: Zones) => {
      this.getPlayerZone(playerId, zone)?.cards.forEach((card) => {
        card.updateCardMeta({
          playedThisTurn: false,
        });

        const hasExertRestriction = card.hasExertRestriction;
        if (!hasExertRestriction) {
          card.updateCardMeta({
            exerted: false,
          });
        }
      });
    });

    const locationsInPlay: TargetFilter[] = [
      { filter: "zone", value: ["play"] },
      { filter: "type", value: "location" },
      { filter: "owner", value: playerId },
    ];

    this.cardStore
      .getCardsByFilter(locationsInPlay, playerId)
      .forEach((locationCard) => {
        locationCard.gainLocationLore();
      });

    this.triggeredStore.onStartOfTurn(playerId);

    this.drawCard(playerId);
    this.resetPriority();
    return this.moveResponse(true);
  }

  changePriority(playerId: string) {
    this.priorityPlayer = playerId;
  }

  resetPriority() {
    const topLayer =
      this.stackLayerStore.layers[this.stackLayerStore.layers.length - 1];

    if (!topLayer) {
      this.changePriority(this.turnPlayer);
    }

    if (topLayer) {
      this.changePriority(topLayer.responder);
    }
  }

  // TODO: Move this to cardModel
  shiftCard(shifter?: string, shifted?: string) {
    if (shifter && shifted) {
      this.cardStore.shiftCard(shifter, shifted);
    }
  }

  sing(songId?: string, singerId?: string) {
    if (songId && singerId) {
      const song = this.cardStore.cards[songId];
      const singer = this.cardStore.cards[singerId];

      if (!song || !singer) {
        this.debug("[sing] card not found", songId, singerId);
        return;
      }

      this.cardStore.singCard(song, singer);
    }
  }

  sendNotification(notification: NotificationType): MoveResponse {
    if (process.env.NODE_ENV === "test" || typeof window !== "undefined") {
      this.dependencies.notifier.sendNotification(notification);
    }

    this._pendingNotifications.push(notification);

    return this.moveResponse(false);
  }

  log(entry: LogEntry) {
    try {
      const { logger } = this.dependencies;
      if (process.env.NODE_ENV === "test") {
        let cardName = "";
        if ("instanceId" in entry) {
          cardName = this.cardStore.getCard(entry.instanceId)?.fullName || "";
        }
        if ("source" in entry) {
          cardName = this.cardStore.getCard(entry.source)?.fullName || "";
        }
        if (cardName) {
          // @ts-ignore
          entry.cardName = cardName;
        }
        logger.log(entry);
      }
      this._pendingLogs.push(entry);
      return this.moveResponse(true);
    } catch (e) {
      console.error(e);
      return this.moveResponse(false);
    }
  }

  debug(...args: any[]) {
    console.log(...args);
  }

  analytics(entry: string, params: unknown) {
    this.debug(entry, params);
  }

  tutorCard(instanceId: string) {
    this.tableStore.moveCard(instanceId, "hand");
    return this.log({
      type: "TUTORED",
      instanceId: instanceId,
    });
  }
  // Moves
  alterHand(cards: string[], player: string) {
    this.tableStore.alterHand(cards, player);

    if (this.gameHasStarted()) {
      this.priorityPlayer = this.turnPlayer;
    }

    this.analytics("alterHand", {
      player: player,
      cards: cards
        .map((instanceId) => this.cardStore.getCard(instanceId)?.cardId)
        .filter(notEmptyPredicate),
    });
  }

  addToInkwell(instanceId: string) {
    this.tableStore.addToInkwell(instanceId);
  }

  playCardFromHand(instanceId: string, params?: { bodyguard?: boolean }) {
    const card = this.cardStore.cards[instanceId];
    if (!card) {
      this.debug("[playCardFromHand] card not found", instanceId);
      return;
    }

    card.playFromHand(params);
  }

  scry(
    playerId: string,
    top: string[] = [],
    bottom: string[] = [],
    hand: string[] = [],
    // No filter means no cards
    tutorFilters: TargetFilter[] = [],
    limits: {
      top?: number;
      bottom?: number;
      hand?: number;
    } = {},
    shouldReveal?: boolean,
  ) {
    if (playerId !== this.activePlayer) {
      throw new Error("You can only scry your own cards");
    }

    this.tableStore.scry(
      top
        .map((instanceId) => this.cardStore.getCard(instanceId))
        .filter(notEmptyPredicate),
      bottom
        .map((instanceId) => this.cardStore.getCard(instanceId))
        .filter(notEmptyPredicate),
      hand
        .map((instanceId) => this.cardStore.getCard(instanceId))
        .filter(notEmptyPredicate),
      tutorFilters,
      limits,
      shouldReveal,
    );
  }

  undoTurn() {
    if (!this.undoState) {
      return this.sendNotification({
        type: "icon",
        title: "No undo state",
        message: "You can't undo any further",
        icon: "error",
        autoClear: true,
      });
    }

    const undoState = JSON.parse(this.undoState);
    this.sync(undoState);

    return this.log({ type: "UNDO_TURN", turn: this.turnCount });
  }

  get isLoading() {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
  }

  debugCondition(conditions: Condition[] = [], card: CardModel) {
    conditions.forEach((condition) => {
      this.debug(
        `Condition ${condition.type}: ${this.effectStore.metCondition(card, [
          condition,
        ])}`,
      );

      if (condition.type === "filter") {
        const result = this.cardStore.getCardsByFilter(
          condition.filters,
          card.ownerId,
          card,
        );
        this.debug(
          `[${
            result.length !== 0 ? "PASSED" : "FAILED"
          }] Filter ${JSON.stringify(condition.filters)}: ${result.map(
            (card) => card.fullName,
          )}`,
        );

        condition.filters.forEach((currentFilter) => {
          const result = this.cardStore.getCardsByFilter(
            [currentFilter],
            card.ownerId,
            card,
          );

          this.debug(
            `[${
              result.length !== 0 ? "PASSED" : "FAILED"
            }] Filter ${JSON.stringify(currentFilter)}: ${result.map(
              (card) => card.fullName,
            )}`,
          );
        });
      } else {
        this.debug(JSON.stringify(condition));
      }
    });
  }
}
