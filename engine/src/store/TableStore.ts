import { makeAutoObservable, toJS } from "mobx";
import type { Dependencies } from "@lorcanito/engine/store/types";
import { TableModel } from "@lorcanito/engine/store/models/TableModel";
import { CardStore } from "@lorcanito/engine/store/CardStore";
import type {
  MobXRootStore,
  MoveResponse,
} from "@lorcanito/engine/store/RootStore";
import { CardModel } from "@lorcanito/engine/store/models/CardModel";
import type { Table, Zones, Game } from "@lorcanito/engine/types";
import { createLogEntry } from "@lorcanito/engine/CreateLogEntry";
import { Random } from "@lorcanito/engine/random";
import { TargetFilter } from "@lorcanito/engine/filter/targetFilter";

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

  getTables(): TableModel[] {
    return Object.values(this.tables);
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

  payInk(table: TableModel, amount: number) {
    const availableInk =
      this.tables[table.ownerId]?.zones?.inkwell?.cards.filter(
        (card) => card.ready,
      ) || [];

    if (availableInk.length < amount) {
      console.error("Not enough ink");
      return false;
    }

    availableInk?.slice(0, amount).forEach((card) => {
      card.updateCardMeta({ exerted: true });
    });

    return true;
  }

  alterHand(cardsToAlter: string[], playerId: string) {
    const table = this.getTable(playerId);

    if (table.readyToStart) {
      console.error("Game already started");
      return;
    }

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

    Promise.all(
      cardsToAlter.map((card) => {
        this.moveCard(card, "deck", { position: "first", skipLog: true });
      }),
    );

    this.rootStore.drawCard(playerId, cardsToAlter.length, true);

    if (cardsToAlter.length) {
      this.shuffleDeck(playerId);
    }

    table.readyToStart = true;

    if (this.rootStore.gameHasStarted()) {
      this.rootStore.changePriority(this.rootStore.turnPlayer);
    }
  }

  findCardZone(card: CardModel) {
    const table = this.tables[card.ownerId];
    if (!table) {
      console.error("Table not found", card.ownerId);
      return;
    }

    const zones = table.zones;
    return Object.keys(zones).find((zone) => {
      return zones[zone as Zones]?.hasCard(card);
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

  move(
    card: CardModel,
    to: Zones,
    opts: {
      skipLog?: true;
      position?: "first" | "last";
      discard?: boolean;
    } = {},
  ) {
    this.moveCard(card.instanceId, to, opts);
  }

  moveCard(
    instanceId: string = "",
    to: Zones,
    opts: {
      skipLog?: boolean;
      position?: "first" | "last";
      discard?: boolean;
    } = {},
  ): MoveResponse {
    const { skipLog = false, position = "last", discard = false } = opts;
    const card = this.cardStore.cards[instanceId];

    if (!card) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Card not found",
        message: `Card not found`,
        icon: "warning",
        autoClear: true,
      });
    }

    const owner = card?.ownerId;
    const table = this.tables[owner];
    if (!table) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Table not found",
        message: `Table not found`,
        icon: "warning",
        autoClear: true,
      });
    }

    return table.moveCard(card, to, position, skipLog, discard);
  }

  playCardFromHand(card: CardModel, params?: { bodyguard?: boolean }) {
    const table = this.getTable(card.ownerId);
    const isCardInHand = table?.zones?.hand?.hasCard(card);
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

    return this.rootStore.log({
      type: "LORE_CHANGE",
      player: player,
      from: playerLore,
      to: lore,
    });
  }

  shuffleDeck(player: string): MoveResponse {
    const { logger } = this.dependencies;

    const state = { seed: this.rootStore.seed || Random.seed() };
    const random = new Random(state);

    const table = this.tables[player];
    if (table?.zones.deck) {
      table.zones.deck.cards = random.api().Shuffle(table.zones.deck.cards);
    }

    logger.log({ type: "SHUFFLE_DECK" });
    return this.rootStore.moveResponse(true);
  }

  scry(
    top: CardModel[] = [],
    bottom: CardModel[] = [],
    hand: CardModel[] = [],
    // No filter means No cards
    tutorFilters: TargetFilter[] = [],
    limits: {
      top?: number;
      bottom?: number;
      hand?: number;
    } = {},
    shouldReveal?: boolean,
  ): MoveResponse {
    const {
      top: topLimit = 0,
      bottom: bottomLimit = 0,
      hand: handLimit = 0,
    } = limits;

    // TODO: We should verify whether the player that is scrying owns the cards
    hand.slice(handLimit ? hand.length - handLimit : 0).forEach((card) => {
      if (card.isValidTarget(tutorFilters)) {
        card.moveTo("hand", { skipLog: true });
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
      card.moveTo("deck", { skipLog: true });
    });

    bottom
      .reverse()
      .slice(bottomLimit ? bottom.length - bottomLimit : 0)
      .forEach((card) => {
        card.moveTo("deck", { position: "first", skipLog: true });
      });

    if (hand.length > handLimit) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Too many cards in hand",
        message: `You selected ${hand.length} cards, but you can only tutor ${handLimit} cards`,
        icon: "warning",
        autoClear: true,
      });
    }
    if (top.length > topLimit) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Too many cards on top",
        message: `You selected ${top.length} cards, but you can only put ${topLimit} cards on top`,
        icon: "warning",
        autoClear: true,
      });
    }
    if (bottom.length > bottomLimit) {
      this.rootStore.sendNotification({
        type: "icon",
        title: "Too many cards on bottom",
        message: `You selected ${bottom.length} cards, but you can only put ${bottomLimit} cards on bottom`,
        icon: "warning",
        autoClear: true,
      });
    }

    this.rootStore.log({
      type: "SCRY",
      top: top.length,
      bottom: bottom.length,
      hand: shouldReveal ? hand.map((card) => card.instanceId) : hand.length,
      shouldReveal,
    });

    return this.rootStore.moveResponse(true);
  }

  addToInkwell(instanceId: string): MoveResponse {
    const card = this.cardStore.cards[instanceId];
    const lorcanitoCard = card?.lorcanitoCard;

    if (!lorcanitoCard?.inkwell) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "This card doesn't contain inkwell symbol",
        message: `You can instead right click the card and select "Move card to Inkwell" option, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
    }

    if (!card || !lorcanitoCard) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "Card not found",
        message: `Card not found`,
        icon: "warning",
        autoClear: true,
      });
    }

    const owner = card.ownerId;
    const tableModel = this.getTable(owner);
    const hasReachedLimit = !tableModel.canAddToInkwell();

    if (hasReachedLimit) {
      return this.rootStore.sendNotification({
        type: "icon",
        title: "You already added a card to the inkwell this turn",
        message: `You can instead right click the card and select "Move card to Inkwell" option, if you want to skip this check.`,
        icon: "warning",
        autoClear: true,
      });
    }

    tableModel.turn.cardsAddedToInkWell.push(card);
    return this.moveCard(instanceId, "inkwell");
  }

  getPlayerZone(ownerId: string, zone: Zones) {
    return this.getTable(ownerId)?.zones[zone];
  }

  getPlayerZoneCards(ownerId: string, zone: Zones) {
    return this.getTable(ownerId)?.zones[zone]?.cards || [];
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

  drawCards(
    ownerId: string,
    amount: number = 1,
    skipLog = false,
  ): MoveResponse {
    const cards: string[] = [];
    [...Array(amount).keys()].forEach(() => {
      const topCard = this.getTopDeckCard(ownerId);
      const instanceId = topCard?.instanceId;

      if (!instanceId) {
        this.rootStore.debug("Empty Deck");
        return;
      } else {
        cards.push(instanceId);
      }

      this.moveCard(instanceId, "hand", { skipLog: amount > 1 });
    });

    if (amount > 1) {
      this.rootStore.log(
        createLogEntry(
          {
            type: "DRAW",
            player: ownerId,
            cards,
          },
          ownerId,
        ),
      );
    }

    return this.rootStore.moveResponse(true);
  }

  discardCards(cards: CardModel[]): MoveResponse {
    cards.forEach((card) => {
      card.discard();
    });

    const yourCards = cards.filter(
      (card) => card.ownerId === this.rootStore.activePlayer,
    );
    if (yourCards.length >= 1) {
      this.rootStore.log(
        createLogEntry(
          {
            type: "DISCARD",
            cards: yourCards.map((card) => card.instanceId),
          },
          yourCards[0]?.ownerId || "",
        ),
      );
    }

    const opponentCards = cards.filter(
      (card) => card.ownerId !== this.rootStore.activePlayer,
    );
    if (opponentCards.length >= 1) {
      this.rootStore.log(
        createLogEntry(
          {
            type: "DISCARD",
            cards: opponentCards.map((card) => card.instanceId),
          },
          opponentCards[0]?.ownerId || "",
        ),
      );
    }

    return this.rootStore.moveResponse(true);
  }
}
