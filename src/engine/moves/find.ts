import { type Game } from "~/libs/game";

export function findTableCardFactory(game: Game) {
  return function findCard(instanceId: string) {
    return game.cards[instanceId];
  };
}

export function findCardOwnerFactory(game: Game) {
  return function findCardOwner(instanceId: string): string {
    return game.cards?.[instanceId]?.ownerId || "";
  };
}
