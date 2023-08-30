import type { LorcanitoGameState } from "~/engine/rule-engine/lorcana/types";
import type { TableCard, Zones } from "~/providers/TabletopProvider";
import { allCardsById } from "~/engine/cards";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "~/engine/redux";
import { Game } from "~/libs/game";
import {
  LorcanitoCard,
  shiftAbilityPredicate,
  singerAbilityPredicate,
} from "~/engine/cardTypes";
import { state } from "next-auth/core/lib/oauth/checks";

// TODO: Move all to draft safe selectors
// TODO: Fix this, the same selector is used in multiple places
export const selectGame = (
  state: RootState | RootState["game"]
): RootState["game"] => {
  if ("game" in state) {
    return state.game;
  }

  // TODO: THIS CAN CAUSE SERIOUS ISSUES
  return state;
};

export const selectCardOwner = createDraftSafeSelector(
  [selectGame, (state, instanceId) => instanceId],
  (state: Game, instanceId = "") => state.cards?.[instanceId]?.ownerId || ""
);

export const selectTurnPlayer = createDraftSafeSelector(
  [selectGame],
  (state: Game) => state.turnPlayer
);

export const selectPlayerZone = createDraftSafeSelector(
  [
    selectGame,
    (state, playerId: string, zone: Zones) => playerId,
    (state, playerId: string, zone: Zones) => zone,
  ],
  (state: Game, playerId, zone, ...rest) => {
    return state.tables[playerId]?.zones?.[zone] || [];
  }
);

export function selectTable(state: LorcanitoGameState, instanceId = "") {
  if (!instanceId) {
    // console.log("[selectTable] missing instanceid");
    return undefined;
  }
  const ownerId = selectCardOwner(state, instanceId);

  if (!ownerId) {
    return undefined;
  }

  return state?.cards[instanceId];
}

export function selectTableCard(
  state: LorcanitoGameState,
  instanceId = ""
): TableCard | undefined {
  if (!instanceId) {
    // console.log("[selectTableCard] missing instanceid");
    return undefined;
  }

  return state?.cards[instanceId];
}

export function selectLorcanitoCard(
  state: LorcanitoGameState,
  instanceId = ""
): undefined | LorcanitoCard {
  const cardId = selectTableCard(state, instanceId)?.cardId;
  if (!cardId) {
    return undefined;
  }

  return allCardsById[cardId];
}

export function selectPlayers(state: { game: RootState["game"] }) {
  return Object.keys(state.game.tables || {}) || [];
}

export function selectPendingEffects(state: RootState) {
  return state.game?.effects || [];
}

export function selectPlayerLore(
  state: LorcanitoGameState,
  playerId: string = ""
): number {
  return state.tables[playerId]?.lore || 0;
}

export function selectShiftCost(
  G: LorcanitoGameState,
  instanceId: string
): number {
  const card = selectLorcanitoCard(G, instanceId);
  const shiftAbility = card?.abilities?.find(shiftAbilityPredicate);

  if (shiftAbilityPredicate(shiftAbility)) {
    return shiftAbility.shift;
  }

  return 0;
}

export function selectCardMeta(state: LorcanitoGameState, instanceId = "") {
  return state?.cards[instanceId]?.meta || {};
}

export function selectSingCost(G: LorcanitoGameState, instanceId = ""): number {
  const singer = selectLorcanitoCard(G, instanceId);
  const singerAbility = singer?.abilities?.find(singerAbilityPredicate);

  if (singerAbilityPredicate(singerAbility)) {
    return singerAbility.value;
  }

  return 0;
}

// Top is the last card of the array to minimize data traffic, as changing the top happens more often.
export const selectTopDeckCard = createDraftSafeSelector(
  [
    (state: Game, playerId: string) =>
      selectPlayerZone(state, playerId, "deck"),
  ],
  (zone: string[]) => {
    return zone[zone.length - 1];
  }
);

export function selectBottomDeckCard(
  state: LorcanitoGameState,
  playerId: string
) {
  const deck = selectPlayerZone(state, playerId, "deck");
  return deck[0] || "";
}

export function selectNextTurnPlayer(players: string[], playerId: string) {
  const next = (players.findIndex((p) => p === playerId) + 1) % players.length;

  return players[next] || playerId;
}

export function selectAreAllPlayerReady(state: RootState) {
  const tables = Object.values(state.game.tables || {});
  return (
    tables.every((table) => {
      return table.readyToStart;
    }) && tables.length > 0
  );
}
