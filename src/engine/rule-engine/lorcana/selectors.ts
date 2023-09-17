import type { LorcanitoGameState } from "~/engine/rule-engine/lorcana/types";
import type { TableCard, Zones } from "~/providers/TabletopProvider";
import { allCardsById } from "~/engine/cards/cards";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { Game } from "~/libs/game";
import { LorcanitoCard } from "~/engine/cardTypes";
import { shiftAbilityPredicate } from "~/engine/abilities";

// TODO: Move all to draft safe selectors
// TODO: Fix this, the same selector is used in multiple places
export const selectGame = (state: Game): Game => {
  if ("game" in state) {
    // @ts-ignore
    return state.game;
  }

  // TODO: THIS CAN CAUSE SERIOUS ISSUES
  return state;
};

export const selectCardOwner = createDraftSafeSelector(
  [selectGame, (state, instanceId) => instanceId],
  (state: Game, instanceId = "") => state.cards?.[instanceId]?.ownerId || ""
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

export function selectTableCard(
  state: LorcanitoGameState,
  instanceId: string | null = ""
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
