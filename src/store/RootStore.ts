import { get, keys, makeAutoObservable, toJS } from "mobx";
import { selectNextTurnPlayer } from "~/engine/rule-engine/lorcana/selectors";
import { Meta, Zones } from "~/providers/TabletopProvider";

import { TableStore } from "~/store/TableStore";
import { Game } from "~/libs/game";
import { Dependencies } from "~/store/types";
import { CardStore } from "~/store/CardStore";
import { StackLayerStore } from "~/store/StackLayerStore";
import type { LogEntry } from "~/spaces/Log/types";
import { NotificationType } from "~/providers/NotificationProvider";
import { StaticTriggeredStore } from "~/store/StaticTriggeredStore";
import { ContinuousEffectStore } from "~/store/ContinuousEffectStore";

export class MobXRootStore {
  dependencies: Dependencies;
  id: string;
  lastActionId: number;
  lastActivity?: number;
  visibility: "public" | "private";
  turnPlayer: string;
  turnCount: number;
  mode: "solo" | "multiplayer";

  // TODO: figure out how ot get rid of this
  players: Record<string, boolean>;

  // stores
  tableStore: TableStore;
  cardStore: CardStore;
  stackLayerStore: StackLayerStore;
  staticTriggeredStore: StaticTriggeredStore;
  continuousEffectStore: ContinuousEffectStore;

  constructor(initialState: Game, dependencies: Dependencies) {
    makeAutoObservable(this, { dependencies: false });

    this.dependencies = dependencies;

    // state
    this.id = initialState.id;
    this.lastActionId = initialState.lastActionId;
    this.lastActivity = initialState.lastActivity;
    this.visibility = initialState.visibility;
    this.turnPlayer = initialState.turnPlayer;
    this.turnCount = initialState.turnCount;
    this.mode = initialState.mode;
    this.players = initialState.players;

    // stores

    this.cardStore = new CardStore(initialState.cards, dependencies, this);
    this.tableStore = TableStore.fromTable(
      initialState.tables,
      dependencies,
      this.cardStore,
      this
    );
    this.stackLayerStore = new StackLayerStore(
      initialState.effects,
      dependencies,
      this
    );
    this.staticTriggeredStore = new StaticTriggeredStore(this);
    this.continuousEffectStore = new ContinuousEffectStore(
      initialState.continuousEffects,
      this
    );
  }

  sync(game: Game) {
    this.id = game.id;
    this.lastActionId = game.lastActionId;
    this.lastActivity = game.lastActivity;
    this.visibility = game.visibility;
    this.turnPlayer = game.turnPlayer;
    this.turnCount = game.turnCount;
    this.mode = game.mode;
    this.players = game.players;

    this.cardStore.sync(game.cards);
    this.tableStore.sync(game.tables);
    this.stackLayerStore.sync(game.effects);
    this.continuousEffectStore.sync(game.continuousEffects);
    // No need to sync or persist static triggered effects, they are queries as events happen
    // this.staticTriggeredStore = this.staticTriggeredStore
  }

  // This converts the observables into plain objects
  toJSON(): Game {
    return toJS({
      id: this.id,
      lastActionId: this.lastActionId,
      lastActivity: this.lastActivity,
      visibility: this.visibility,
      turnPlayer: this.turnPlayer,
      turnCount: this.turnCount,
      mode: this.mode,
      players: this.players,
      tables: this.tableStore.toJSON(),
      cards: this.cardStore.toJSON(),
      effects: this.stackLayerStore.toJSON(),
      continuousEffects: this.continuousEffectStore.toJSON(),
    });
  }

  playerTable(playerId: string) {
    return this.tableStore.tables[playerId];
  }

  tableCard(instanceId: string) {
    return get(this.cardStore.cards, instanceId);
  }

  getPlayerZone(playerId: string, zone: Zones) {
    return this.tableStore.getPlayerZone(playerId, zone);
  }

  topDeckCard(playerId: string) {
    return this.tableStore.getTopDeckCard(playerId);
  }

  bottomDeckCard(playerId: string) {
    return this.tableStore.getBottomDeckCard(playerId);
  }

  get activePlayer() {
    return this.dependencies.playerId;
  }

  get opponentPlayer() {
    return selectNextTurnPlayer(
      keys(this.tableStore.tables) as string[],
      this.activePlayer
    );
  }

  get isMyTurn() {
    return this.turnPlayer === this.dependencies.playerId;
  }

  updateCardMeta(instanceId: string, meta: Meta) {
    this.cardStore.updateCardMeta(instanceId, meta);
  }

  moveCard(
    instanceId: string = "",
    from: Zones,
    to: Zones,
    position: "first" | "last" = "last"
  ) {
    this.tableStore.moveCard(instanceId, from, to, position);
  }

  drawCard(playerId: string, amount: number = 1) {
    this.tableStore.drawCards(playerId, amount);
  }

  passTurn(playerId: string, force: boolean = false) {
    const nextTurnPlayer = selectNextTurnPlayer(
      keys(this.tableStore.tables) as string[],
      this.turnPlayer
    );

    const playArea = this.playerTable(this.turnPlayer)?.zones.play.cards || [];
    const opponentPlayArea =
      this.playerTable(nextTurnPlayer)?.zones.play.cards || [];

    const hasPendingRecklessCard = playArea
      ?.filter((card) => card.hasReckless)
      .some((recklessGlimmer) => {
        return opponentPlayArea.some((opponentCard) =>
          recklessGlimmer.canChallenge(opponentCard)
        );
      });

    if (hasPendingRecklessCard && !force) {
      this.sendNotification({
        type: "icon",
        title:
          "You have a reckless card that can still challenge your opponent",
        message: `You can instead use manual mode to skip this check, right click on the table and select pass turn (force)`,
        icon: "warning",
        autoClear: true,
      });
      this.dependencies.modals.openYesOrNoModal({
        title:
          "You have a reckless card that can still challenge your opponent",
        text: "This means they MUST challenge if possible, do you want to force passing the turn?",
        onYes: () => {
          this.passTurn(playerId, true);
        },
        onNo: () => {},
      });

      return;
    }

    this.log({ type: "PASS_TURN", player: playerId, turn: this.turnCount });

    this.turnCount++;
    this.turnPlayer = nextTurnPlayer;

    const zones: Zones[] = ["play", "inkwell"];
    zones.forEach((zone: Zones) => {
      this.getPlayerZone(nextTurnPlayer, zone)?.cards.forEach((card) => {
        card.updateCardMeta({
          playedThisTurn: false,
          exerted: false,
        });
      });
    });

    this.continuousEffectStore.continuousEffects.forEach((effect) => {
      if (
        // turn can be 0
        effect.duration?.turn !== undefined &&
        effect.duration?.turn < this.turnCount
      ) {
        this.continuousEffectStore.stopContinuousEffect(effect);
      }
    });

    this.drawCard(nextTurnPlayer);
    // logAnalyticsEvent("pass_turn");
  }

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
        console.log("[sing] card not found", songId, singerId);
        return;
      }

      this.cardStore.singCard(song, singer);
    }
  }

  alterHand(cards: string[], player: string) {
    this.tableStore.alterHand(cards, player);
  }

  playCardFromHand(instanceId: string, params?: { bodyguard?: boolean }) {
    const card = this.cardStore.cards[instanceId];
    if (!card) {
      console.log("[playCardFromHand] card not found", instanceId);
      return;
    }

    card.playFromHand(params);
  }

  sendNotification(notification: NotificationType) {
    const {
      notifier: { sendNotification },
    } = this.dependencies;

    sendNotification(notification);
  }

  log(entry: LogEntry) {
    const { logger } = this.dependencies;
    logger.log(entry);
  }
}
