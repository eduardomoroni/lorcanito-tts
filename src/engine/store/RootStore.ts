import { get, keys, makeAutoObservable, toJS } from "mobx";
import { Meta, Zones } from "~/spaces/providers/TabletopProvider";

import { TableStore } from "~/engine/store/TableStore";
import { Game } from "~/libs/game";
import { Dependencies } from "~/engine/store/types";
import { CardStore } from "~/engine/store/CardStore";
import { StackLayerStore } from "~/engine/store/StackLayerStore";
import type { LogEntry } from "~/spaces/Log/types";
import { NotificationType } from "~/spaces/providers/NotificationProvider";
import { StaticTriggeredStore } from "~/engine/store/StaticTriggeredStore";
import { ContinuousEffectStore } from "~/engine/store/ContinuousEffectStore";

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
  turnCount: number;
  mode: "solo" | "multiplayer";

  // TODO: figure out how ot get rid of this
  players: Record<string, boolean>;

  // stores
  tableStore: TableStore;
  cardStore: CardStore;
  stackLayerStore: StackLayerStore;
  triggeredStore: StaticTriggeredStore;
  continuousEffectStore: ContinuousEffectStore;

  constructor(
    initialState: Game,
    dependencies: Dependencies,
    observable = true,
  ) {
    if (observable) {
      makeAutoObservable(this, { dependencies: false });
    }

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
    this.triggeredStore.sync(game.triggeredAbilities);
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
      triggeredAbilities: this.triggeredStore.toJSON(),
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

  opponentPlayer(playerId: string) {
    return selectNextTurnPlayer(
      keys(this.tableStore.tables) as string[],
      playerId,
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
    position: "first" | "last" = "last",
  ) {
    this.tableStore.moveCard(instanceId, from, to, position);
  }

  drawCard(playerId: string, amount: number = 1) {
    this.tableStore.drawCards(playerId, amount);
  }

  passTurn(playerId: string, force: boolean = false) {
    const nextTurnPlayer = selectNextTurnPlayer(
      keys(this.tableStore.tables) as string[],
      this.turnPlayer,
    );

    const currentPlayerTable = this.tableStore.getTable(this.turnPlayer);
    const nextTurnPlayerTable = this.tableStore.getTable(nextTurnPlayer);

    const playArea = currentPlayerTable?.zones.play.cards || [];
    const opponentPlayArea =
      this.playerTable(nextTurnPlayer)?.zones.play.cards || [];

    const hasPendingRecklessCard = playArea
      ?.filter((card) => card.hasReckless)
      .some((recklessGlimmer) => {
        return opponentPlayArea.some((opponentCard) =>
          recklessGlimmer.canChallenge(opponentCard),
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

    nextTurnPlayerTable.resetInkwell();
    currentPlayerTable.resetInkwell();

    this.turnCount++;
    this.turnPlayer = nextTurnPlayer;

    this.continuousEffectStore.onTurnPassed(this.turnCount);
    this.triggeredStore.onTurnPassed(this.turnCount);

    this.readySetDraw(nextTurnPlayer);
  }

  readySetDraw(playerId: string) {
    const zones: Zones[] = ["play", "inkwell"];
    zones.forEach((zone: Zones) => {
      this.getPlayerZone(playerId, zone)?.cards.forEach((card) => {
        const hasExertRestriction = card.hasExertRestriction;
        if (!hasExertRestriction) {
          card.updateCardMeta({
            playedThisTurn: false,
            exerted: false,
          });
        }
      });
    });

    this.drawCard(playerId);
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
    try {
      const { logger } = this.dependencies;
      logger.log(entry);
    } catch (e) {
      console.error(e);
    }
  }
}
