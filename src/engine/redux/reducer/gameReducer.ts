import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createEmptyGame, type Game } from "~/libs/game";
import { Random } from "~/engine/redux/middleware/random";
import {
  selectCardMeta,
  selectCardOwner,
  selectLorcanitoCard,
  selectNextTurnPlayer,
  selectPlayerLore,
  selectPlayerZone,
  selectShiftCost,
  selectSingCost,
  selectTable,
  selectTableCard,
} from "~/engine/rule-engine/lorcana/selectors";
import { Meta, TableCard, Zones } from "~/providers/TabletopProvider";
import { moveCardHelperTable } from "~/3rd-party/firebase/database/mutableHelpers";
import {
  setCardMeta,
  updateCardMeta,
} from "~/engine/rule-engine/lorcana/immerMutation";
import { WritableDraft } from "immer/dist/internal";
import {
  challengerAbilityPredicate,
  LorcanitoCard,
  resolutionAbilityPredicate,
} from "~/engine/cardTypes";
import { selectByFilter } from "~/components/modals/target/filterPredicates";
import { createId } from "@paralleldrive/cuid2";

const initialState: Game = createEmptyGame("INITIAL_GAME");

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // Action used to sync clients, it receives the whole game state
    replaceGame(state, action: PayloadAction<{ game: Game }>) {
      return action.payload.game;
    },
    // This is to prevent out of order updates
    tick(state) {
      if (!state.lastActionId) {
        state.lastActionId = 0;
      }

      state.lastActionId++;
    },
    resolveEffect(state, action: PayloadAction<{ effectId: string }>) {
      const { effectId } = action.payload;
      const index = state.effects.findIndex((effect) => effect.id === effectId);
      if (index !== -1) {
        state.effects.splice(index, 1);
      }
    },
    alterHand(
      state,
      action: PayloadAction<{ cardsToAlter: string[]; playerId: string }>
    ) {
      const { cardsToAlter, playerId } = action.payload;

      const random = new Random(/*state.seed*/);
      const zones = state.tables[playerId]?.zones;

      if (!zones || !zones.deck || !zones.hand) {
        return;
      }

      cardsToAlter.forEach((card) => {
        if (!zones.deck || !zones.hand) {
          return;
        }

        zones.deck.push(card);
        const item = zones.deck.shift();

        if (item) {
          zones.hand.push(item);
        }

        const index = zones.hand.findIndex((handCard) => handCard === card);
        if (index !== -1) {
          zones.hand.splice(index, 1);
        }
      });

      zones.deck = random.api().Shuffle(zones.deck);

      if (state.tables[playerId]) {
        // @ts-expect-error there's a check above
        state.tables[playerId].readyToStart = true;
      }
    },
    shuffleDeck(state, action: PayloadAction<{ playerId: string }>) {
      const { playerId } = action.payload;
      shuffleDeckReducer(state, playerId);
    },
    shuffleCardIntoDeck(
      state,
      action: PayloadAction<{ instanceId: string; from: Zones }>
    ) {
      const { instanceId, from } = action.payload;
      const owner = selectCardOwner(state, instanceId);
      moveCardReducer(state, instanceId, from, "deck", "last");
      shuffleDeckReducer(state, owner);
    },
    setPlayerLore(
      state,
      action: PayloadAction<{ playerId: string; lore: number }>
    ) {
      const { playerId, lore } = action.payload;
      setPlayerLoreReducer(state, playerId, lore);
    },
    payInkCostForCard(state, action: PayloadAction<{ instanceId: string }>) {
      const { instanceId } = action.payload;
      payInkCostForCardReducer(state, instanceId);
    },
    payInkCost(state, action: PayloadAction<{ cost: number; owner: string }>) {
      const { cost, owner } = action.payload;
      payInkCostReducer(state, cost, owner);
    },
    moveCard(
      state,
      action: PayloadAction<{
        instanceId: string;
        from: Zones;
        to: Zones;
        position?: "first" | "last";
      }>
    ) {
      const { instanceId, from, to, position } = action.payload;
      moveCardReducer(state, instanceId, from, to, position);
    },
    scry(
      state,
      action: PayloadAction<{
        top: string[];
        bottom: string[];
      }>
    ) {
      const { top, bottom } = action.payload;
      top.forEach((card) => {
        moveCardReducer(state, card, "deck", "deck", "last");
      });
      bottom.reverse().forEach((card) => {
        moveCardReducer(state, card, "deck", "deck", "first");
      });
    },
    passTurn(state, action: PayloadAction<{ playerId: string }>) {
      const nextTurnPlayer = selectNextTurnPlayer(
        Object.keys(state.tables),
        state.turnPlayer
      );

      state.turnCount++;
      state.turnPlayer = nextTurnPlayer;

      const zones: Zones[] = ["play", "inkwell"];
      zones.forEach((zone: Zones) => {
        selectPlayerZone(state, nextTurnPlayer, zone).forEach((card) => {
          updateCardMeta(state, card, {
            playedThisTurn: null,
            exerted: null,
          });
        });
      });

      // const topCard = selectTopDeckCard(state, nextTurnPlayer);
      // if (topCard) {
      //   moveCardReducer(state, topCard, "deck", "hand", "last");
      // }
    },
    addToInkwell(state, action: PayloadAction<{ instanceId: string }>) {
      const { instanceId } = action.payload;
      const owner = selectCardOwner(state, instanceId);
      const inkwell = state.tables?.[owner]?.zones.inkwell || [];
      // TODO: reefactor this to filter
      const hasPlayedThisTurn = inkwell.find((card) => {
        return state.cards[card]?.meta?.playedThisTurn;
      });
      const lorcanitoCard = selectLorcanitoCard(state, instanceId);

      if (hasPlayedThisTurn || !lorcanitoCard?.inkwell) {
        return;
      }

      moveCardReducer(state, instanceId, "hand", "inkwell", "last");
    },
    playCardFromHand(
      state,
      action: PayloadAction<{
        instanceId: string;
        params?: { bodyguard?: boolean };
      }>
    ) {
      const { instanceId, params } = action.payload;
      const card = selectLorcanitoCard(state, instanceId);
      const owner = selectCardOwner(state, instanceId);
      const cost = card?.cost || 0;
      const payed = canPayInkCost(state, cost, owner);

      if (!payed) {
        console.error("Not enough ink", cost, owner);
        return;
      }

      const isCardInHand = selectPlayerZone(state, owner, "hand").includes(
        instanceId
      );
      if (!isCardInHand) {
        console.error("Card not in hand");
        return;
      }

      // TODO: Add a log for auto paying
      payInkCostForCardReducer(state, instanceId);
      moveCardReducer(state, instanceId, "hand", "play", "last");

      if (params?.bodyguard) {
        updateCardMeta(state, instanceId, { exerted: true });
      }

      // // TODO: temporary, soon we can remove this
      if (!state.effects) {
        state.effects = [];
      }

      const resolutionAbilities = card?.abilities?.filter(
        resolutionAbilityPredicate
      );

      resolutionAbilities?.forEach((ability) => {
        if (resolutionAbilityPredicate(ability)) {
          state.effects.push({
            id: createId(),
            ability,
            instanceId,
          });
        } else {
          console.error("Ability not found", ability);
        }
      });
    },
    quest(state, action: PayloadAction<{ instanceId: string }>) {
      const { instanceId } = action.payload;

      const card = selectLorcanitoCard(state, instanceId);
      const owner = selectCardOwner(state, instanceId);

      if (!instanceId || !card) {
        console.log("Card not found", instanceId);
        return;
      }

      const playerLore = selectPlayerLore(state, owner);
      if (card.lore) {
        setPlayerLoreReducer(state, owner, playerLore + card.lore);
        setCardMeta(state, instanceId, { exerted: true });
      }
    },
    tapCard(
      state,
      action: PayloadAction<{
        instanceId: string;
        opts: { exerted?: boolean; toggle?: boolean };
      }>
    ) {
      const { instanceId, opts } = action.payload;
      const { exerted, toggle } = opts;
      tapCardReducer(state, instanceId, { exerted, toggle });
    },
    revealCard(state, action: PayloadAction<{ instanceId: string }>) {
      const { instanceId } = action.payload;

      updateCardMeta(state, instanceId, { revealed: true });
    },
    updateCardDamage(
      state,
      action: PayloadAction<{
        instanceId: string;
        amount: number;
        type: "add" | "remove";
      }>
    ) {
      const { instanceId, type, amount } = action.payload;

      const cardDamageCounter = selectCardMeta(state, instanceId)?.damage || 0;
      const damage: number =
        type === "add"
          ? cardDamageCounter + amount
          : cardDamageCounter - amount;

      if (damage < 0) {
        console.log("Damage can't be negative");
        return;
      }
      updateCardMeta(state, instanceId, {
        damage,
      });

      // if (promise?.committed) {
      //   logger.log({
      //     type: "DAMAGE_CHANGE",
      //     instanceId,
      //     // amount: amount,
      //     to: damage,
      //     from: cardDamageCounter,
      //   });
      // }
    },
    singCard(
      state,
      action: PayloadAction<{ songId: string; singerId: string }>
    ) {
      const { songId, singerId } = action.payload;

      const song = selectLorcanitoCard(state, songId);
      const singer = selectLorcanitoCard(state, singerId);

      if (!song || !singer) {
        console.error("song or singer not found");
        return;
      }

      const singerCostReduction: number = selectSingCost(state, singerId);

      if (song.cost > (singerCostReduction || singer.cost)) {
        return;
      }

      tapCardReducer(state, singerId, { exerted: true });
      // TODO: Enable this once all songs aree coded
      moveCardReducer(state, songId, "hand", "play", "last");
    },
    challenge(
      state,
      action: PayloadAction<{ attackerId: string; defenderId: string }>
    ) {
      const { attackerId, defenderId } = action.payload;

      const attacker = selectTableCard(state, attackerId);
      const defender = selectTableCard(state, defenderId);
      if (!attacker || !defender) {
        console.error("challenger or challenged is undefined");
        return;
      }

      const defenderPlayer = selectCardOwner(state, defenderId);
      const defenderBodyGuards = selectByFilter(
        [
          { filter: "owner", value: defenderPlayer },
          { filter: "zone", value: "play" },
          { filter: "status", value: "exerted" },
          { filter: "keyword", value: "bodyguard" },
        ],
        defenderPlayer
      )({ game: state });

      if (
        defenderBodyGuards.length > 0 &&
        !defenderBodyGuards.find((card) => card.instanceId === defenderId)
      ) {
        console.log("Can't challenge a bodyguarded card");
        return;
      }

      const defenderCard = selectLorcanitoCard(state, defenderId);
      const attackerCard = selectLorcanitoCard(state, attackerId);
      let attackerStrength = attackerCard?.strength || 0;
      const challengerAbility = attackerCard?.abilities?.find(
        challengerAbilityPredicate
      );
      if (challengerAbilityPredicate(challengerAbility)) {
        attackerStrength += challengerAbility.value;
      }

      setCardMeta(state, attackerId, {
        exerted: true,
        damage: (attacker.meta?.damage || 0) + (defenderCard?.strength || 0),
      });
      setCardMeta(state, defenderId, {
        damage: (defender.meta?.damage || 0) + attackerStrength,
      });

      // TODO: Only enable once the full engine is implemented
      // if (isDead(defender, defenderCard)) {
      //   // TODO: Add log
      //   moveCardReducer(state, defenderId, "play", "discard", "last");
      // }
      // if (isDead(attacker, attackerCard)) {
      //   // TODO: Add log
      //   moveCardReducer(state, attackerId, "play", "discard", "last");
      // }
    },
    shift(state, action: PayloadAction<{ shifter: string; shifted: string }>) {
      const { shifted, shifter } = action.payload;

      const owner = selectCardOwner(state, shifter);
      const shiftCost = selectShiftCost(state, shifter);

      const payed = canPayInkCost(state, shiftCost, owner);

      // TODO: CHECK IF SHIFT IS POSSIBLE
      if (payed) {
        payInkCostReducer(state, shiftCost, owner);
        moveCardReducer(state, shifter, "hand", "play");

        const shiftedMeta: Meta = selectTableCard(state, shifted)?.meta || {};
        const combinedMeta: Meta = {
          ...shiftedMeta,
          shifter,
          shifted,
        };

        setCardMeta(state, shifted, combinedMeta);
        setCardMeta(state, shifter, combinedMeta);
        // logAnalyticsEvent("shift");
      } else {
        // TODO: Log: Not enough ink
      }
    },
  },
});

function isDead(tableCard?: TableCard, lorcanitoCard?: LorcanitoCard) {
  return (tableCard?.meta?.damage || 0) >= (lorcanitoCard?.willpower || 0);
}
function setPlayerLoreReducer(
  state: WritableDraft<Game>,
  playerId: string,
  lore: number
) {
  const table = state.tables[playerId];
  if (table) {
    table.lore = lore;
  }
}

function shuffleDeckReducer(state: WritableDraft<Game>, playerId: string) {
  const random = new Random(/*state.seed*/);

  const table = state.tables[playerId];
  if (table?.zones.deck) {
    table.zones.deck = random.api().Shuffle(table.zones.deck);
  }
}

function moveCardReducer(
  state: WritableDraft<Game>,
  instanceId: string,
  from: Zones,
  to: Zones,
  position: "first" | "last" = "last"
) {
  const owner = selectCardOwner(state, instanceId);
  if (!instanceId || !from || !to || !owner) {
    console.error(`[moveCard] Invalid moveCard params: `, {
      instanceId,
      from,
      to,
      owner,
    });
    return;
  }

  if (from === to && from !== "deck") {
    console.log("Moving same zone", from, to);
    return;
  }

  const fromZone = selectPlayerZone(state, owner, from);
  if (!fromZone.includes(instanceId)) {
    console.error("Card not found in zone", instanceId, from, owner);
    return;
  }

  const shifted = state.cards?.[instanceId]?.meta?.shifted;
  if (shifted && shifted !== instanceId) {
    moveCardReducer(state, shifted, from, "discard", "last");
  }

  if (["play", "inkwell"].includes(to)) {
    setCardMeta(state, instanceId, { playedThisTurn: true });
  } else {
    setCardMeta(state, instanceId, null);
  }

  moveCardHelperTable(state.tables[owner], instanceId, from, to, position);
}

export function canPayInkCostForCard(state: Game, instanceId: string) {
  const card = selectLorcanitoCard(state, instanceId);
  const owner = selectCardOwner(state, instanceId);
  const cost = card?.cost || 0;
  return canPayInkCost(state, cost, owner);
}

export function canPayInkCost(state: Game, cost: number, owner: string) {
  const inkwell = state.tables?.[owner]?.zones.inkwell || [];
  const inkAvailable = inkwell.filter((card) => {
    return selectTable(state, card)?.meta?.exerted !== true;
  });

  return inkAvailable.length >= cost;
}

function payInkCostReducer(
  state: WritableDraft<Game>,
  cost: number,
  owner: string
) {
  const canPay = canPayInkCost(state, cost, owner);

  if (!canPay) {
    // TODO: Send an alert
    return;
  }

  const inkwell = state.tables?.[owner]?.zones.inkwell || [];
  const inkAvailable = inkwell.filter((card) => {
    return selectTable(state, card)?.meta?.exerted !== true;
  });
  inkAvailable.slice(0, cost).forEach((card) => {
    const cardToUpdate = state.cards[card];

    if (cardToUpdate) {
      if (!cardToUpdate?.meta) {
        cardToUpdate.meta = { exerted: true };
      } else {
        cardToUpdate.meta.exerted = true;
      }
    } else {
      console.error("Card not exerted", card);
    }
  });
}
function payInkCostForCardReducer(
  state: WritableDraft<Game>,
  instanceId: string
) {
  const card = selectLorcanitoCard(state, instanceId);
  const owner = selectCardOwner(state, instanceId);
  const cost = card?.cost || 0;

  payInkCostReducer(state, cost, owner);
}

function tapCardReducer(
  state: WritableDraft<Game>,
  instanceId: string,
  param: { exerted?: boolean; toggle?: boolean }
) {
  const { exerted, toggle } = param;
  if (toggle) {
    const cardMeta = selectCardMeta(state, instanceId);
    updateCardMeta(state, instanceId, { exerted: !cardMeta?.exerted });
  } else {
    updateCardMeta(state, instanceId, { exerted: exerted || true });
  }
}

export const {
  alterHand,
  shuffleDeck,
  setPlayerLore,
  tapCard,
  payInkCostForCard,
  payInkCost,
  shuffleCardIntoDeck,
  moveCard,
  replaceGame,
  passTurn,
  addToInkwell,
  playCardFromHand,
  quest,
  revealCard,
  tick,
  updateCardDamage,
  singCard,
  resolveEffect,
  challenge,
  shift,
  scry,
} = gameSlice.actions;

export default gameSlice.reducer;
