import { Table, Zones } from "~/providers/TabletopProvider";
import { makeAutoObservable, toJS } from "mobx";
import { Game } from "~/libs/game";
import { Dependencies } from "~/store/types";
import { TableModel } from "~/store/models/TableModel";
import { CardStore } from "~/store/CardStore";
import { Random } from "~/engine/random";
import { MobXRootStore } from "~/store/RootStore";
import { CardModel } from "~/store/models/CardModel";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import { createLogEntry } from "~/spaces/Log/game-log/GameLogProvider";
import { TargetFilter } from "~/components/modals/target/filters";

export class TableStore {
  dependencies: Dependencies;
  tables: Record<string, TableModel>;
  cardStore: CardStore;
  rootStore: MobXRootStore;

  constructor(
    initialState: Record<string, TableModel>,
    dependencies: Dependencies,
    cardStore: CardStore,
    rootStore: MobXRootStore,
    observable: boolean,
  ) {
    this.dependencies = dependencies;
    this.tables = initialState;
    this.cardStore = cardStore;
    this.rootStore = rootStore;

    if (observable) {
      makeAutoObservable(this, { rootStore: false, dependencies: false });
    }
  }

  static fromTable(
    tables: Record<string, Table>,
    dependencies: Dependencies,
    cardStore: CardStore,
    rootStore: MobXRootStore,
    observable: boolean,
  ): TableStore {
    const tableModels: Record<string, TableModel> = {};

    Object.keys(tables || {}).forEach((playerId) => {
      const table = tables[playerId];
      if (table) {
        tableModels[playerId] = TableModel.fromTable(
          table,
          playerId,
          cardStore,
          rootStore,
          observable,
        );
      }
    });

    return new TableStore(
      tableModels,
      dependencies,
      cardStore,
      rootStore,
      observable,
    );
  }

  sync(tables: Game["tables"]) {
    Object.keys(tables || {}).forEach((playerId) => {
      const table = tables[playerId];
      const tableModel = this.tables[playerId];

      if (table && tableModel) {
        tableModel.sync(table);
      }
    });
  }

  toJSON(): Game["tables"] {
    const tables: Record<string, Table> = {};

    Object.keys(this.tables || {}).forEach((playerId) => {
      const table = this.tables[playerId];

      if (table) {
        tables[playerId] = table.toJSON();
      }
    });

    return toJS(tables);
  }

  getTable(playerId?: string) {
    let table!: TableModel | undefined;
    if (!playerId) {
      const activePlayer = this.rootStore.activePlayer;
      table = this.tables[activePlayer];
    } else {
      table = this.tables[playerId];
    }

    // TODO: FIX THIS
    return table as TableModel;
  }

  payInk(
    table: TableModel,
    card: CardModel,
    params: { shift?: number; byPass?: number } = {},
  ) {
    // TODO: remove this bypass
    const amount = params.byPass || params.shift || card.cost;

    if (!table.canPayInkCost(card, params)) {
      console.log("Cannot pay ink cost", amount);
      return;
    }

    this.tables[table.ownerId]?.zones.inkwell.cards
      .filter((card) => card.ready)
      .slice(0, amount)
      .forEach((card) => {
        card.updateCardMeta({ exerted: true });
      });
  }

  alterHand(cardsToAlter: string[], playerId: string) {
    const table = this.getTable(playerId);

    cardsToAlter.forEach((card) => {
      this.rootStore.drawCard(playerId);
      this.moveCard(card, "hand", "deck", "first");
    });

    this.shuffleDeck(playerId);

    table.readyToStart = true;

    this.rootStore.log(
      createLogEntry(
        {
          type: "MULLIGAN",
          cards: cardsToAlter,
          player: playerId,
        },
        playerId,
      ),
    );
    logAnalyticsEvent("mulligan", { cards: cardsToAlter.length });
  }

  findCardZone(card: CardModel) {
    const table = this.tables[card.ownerId];
    if (!table) {
      console.error("Table not found", card.ownerId);
      return;
    }

    const zones = table.zones;
    return Object.keys(zones).find((zone) => {
      return zones[zone as Zones].hasCard(card);
    });
  }

  getStackCards() {
    const turnPlayer = this.rootStore.activePlayer;

    return (
      this.rootStore.tableStore
        .getPlayerZone(turnPlayer, "play")
        ?.cards.filter((card) => card?.lorcanitoCard?.type === "action") || []
    );
  }

  getPendingEffects() {
    return this.rootStore.stackLayerStore.layers;
  }

  move(card: CardModel, to: Zones, position: "first" | "last" = "last") {
    this.moveCard(card.instanceId, card.zone, to, position);
  }

  moveCard(
    instanceId: string = "",
    from: Zones,
    to: Zones,
    position: "first" | "last" = "last",
  ) {
    const card = this.cardStore.cards[instanceId];

    if (!card) {
      console.error("Card not found", instanceId);
      return;
    }

    const owner = card?.ownerId;
    const table = this.tables[owner];
    if (!table) {
      console.error("Table not found", owner);
      return;
    }

    //TODO: CHeck if card is in zone
    table.moveCard(card, from, to, position);

    this.rootStore.log(
      createLogEntry(
        {
          type: "MOVE_CARD",
          instanceId,
          from,
          to,
          position,
          owner,
        },
        owner,
      ),
    );
    logAnalyticsEvent("move_card", { from, to });
  }

  playCardFromHand(card: CardModel, params?: { bodyguard?: boolean }) {
    const table = this.getTable(card.ownerId);
    const isCardInHand = table?.zones.hand.hasCard(card);
    if (!isCardInHand || !table) {
      console.error("Card not in hand");
      return;
    }

    card.playFromHand(params);
  }

  setPlayerLore(player: string, lore: number) {
    const { logger } = this.dependencies;

    const table = this.getTable(player);

    if (!table) {
      console.error("Table not found", player);
      return;
    }

    const playerLore = table.lore;
    table.lore = lore;

    logger.log({
      type: "LORE_CHANGE",
      player: player,
      from: playerLore,
      to: lore,
    });
    // logAnalyticsEvent("lore_change");
  }

  shuffleDeck(player: string) {
    const { logger } = this.dependencies;

    const random = new Random(/*state.seed*/);

    const table = this.tables[player];
    if (table?.zones.deck) {
      table.zones.deck.cards = random.api().Shuffle(table.zones.deck.cards);
    }

    logger.log({ type: "SHUFFLE_DECK" });
    // logAnalyticsEvent("shuffle_deck");
  }

  scry(
    top: CardModel[] = [],
    bottom: CardModel[] = [],
    hand: CardModel[] = [],
    // No filter means no cards
    tutorFilters: TargetFilter[] = [],
    limits: {
      top?: number;
      bottom?: number;
      hand?: number;
    } = {},
    shouldReveal?: boolean,
  ) {
    const { top: topLimit, bottom: bottomLimit, hand: handLimit } = limits;

    hand.slice(handLimit ? hand.length - handLimit : 0).forEach((card) => {
      if (card.isValidTarget(tutorFilters)) {
        card.moveTo("hand");
      } else {
        this.rootStore.sendNotification({
          type: "icon",
          title: "Cannot tutor card, invalid target",
          message: `You selected an invalid target for the effect`,
          icon: "warning",
          autoClear: true,
        });
      }
    });

    top.slice(topLimit ? top.length - topLimit : 0).forEach((card) => {
      card.moveTo("deck");
    });

    bottom
      .reverse()
      .slice(bottomLimit ? bottom.length - bottomLimit : 0)
      .forEach((card) => {
        card.moveTo("deck", "first");
      });

    this.rootStore.log({
      type: "SCRY",
      top: top.length,
      bottom: bottom.length,
      hand: shouldReveal ? hand.map((card) => card.instanceId) : hand.length,
      shouldReveal,
    });
    logAnalyticsEvent("scry");
  }

  addToInkwell(instanceId: string) {
    const {
      notifier: { sendNotification },
    } = this.dependencies;

    const card = this.cardStore.cards[instanceId];
    const lorcanitoCard = card?.lorcanitoCard;

    if (!card || !lorcanitoCard) {
      console.error("Card not found", instanceId);
      return;
    }

    const owner = card.ownerId;
    const inkwell = this.getTable(owner)?.zones.inkwell.cards || [];
    const hasPlayedThisTurn = inkwell.find((card) => {
      return card?.meta?.playedThisTurn;
    });

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
      this.moveCard(instanceId, "hand", "inkwell");
    }
  }

  getPlayerZone(ownerId: string, zone: Zones) {
    return this.getTable(ownerId)?.zones[zone];
  }

  getPlayerZoneCards(ownerId: string, zone: Zones) {
    return this.getTable(ownerId)?.zones[zone].cards || [];
  }

  getTopDeckCard(ownerId: string) {
    const playerDeck = this.getPlayerZone(ownerId, "deck");

    if (!playerDeck) {
      return undefined;
    }

    return playerDeck.cards[playerDeck.cards.length - 1];
  }

  getBottomDeckCard(ownerId: string) {
    const playerDeck = this.getPlayerZone(ownerId, "deck");

    if (!playerDeck) {
      return undefined;
    }

    return playerDeck.cards[0];
  }

  drawCards(ownerId: string, amount: number = 1) {
    [...Array(amount).keys()].forEach(() => {
      const topCard = this.getTopDeckCard(ownerId);
      if (!topCard) {
        console.log("Empty Deck");
        return;
      }

      this.moveCard(topCard?.instanceId, "deck", "hand");
    });
  }
}
