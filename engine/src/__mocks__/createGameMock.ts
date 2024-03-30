import { createId } from "@paralleldrive/cuid2";
import type { LorcanitoCard } from "@lorcanito/engine/cards/cardTypes";
import type { Game, Zones } from "@lorcanito/engine/types";
import { simbaProtectiveCub } from "@lorcanito/engine/cards/TFC/characters/characters";
import { createEmptyGame } from "@lorcanito/engine/game";

function range(size: number, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type TestInitialState = PartialRecord<
  Zones,
  LorcanitoCard[] | number
> & { lore?: number };

function prepareGame(playerId: string, state: TestInitialState, game: Game) {
  const { lore, ...zones } = state;
  game.tables[playerId] = {
    lore: lore || 0,
    readyToStart: true,
    turn: {
      cardsAddedToInkWell: [],
      cardsPlayed: [],
      cardsDiscarded: [],
      challenges: [],
    },
    zones: {
      discard: [],
      inkwell: [],
      deck: [],
      hand: [],
      play: [],
    },
  };

  Object.keys(zones).forEach((zone) => {
    const value = state[zone as Zones];
    const zoneCards: LorcanitoCard[] =
      typeof value === "number"
        ? range(value).map(() => simbaProtectiveCub)
        : (value as LorcanitoCard[]);

    if (zoneCards) {
      zoneCards.filter(Boolean).forEach((card) => {
        const instanceId = createId();
        game.cards[instanceId] = {
          instanceId,
          ownerId: playerId,
          cardId: card.id,
        };

        const playerTable = game.tables[playerId];
        if (playerTable) {
          const tableZone = game.tables?.[playerId]?.zones?.[zone as Zones];
          if (tableZone) {
            tableZone.push(instanceId);
          } else {
            playerTable.zones[zone as Zones] = [instanceId];
          }
        }
      });
    }
  });
}

export function createMockGame(
  playerState: TestInitialState = {},
  opponentState: TestInitialState = {},
): Game {
  const game = createEmptyGame("TEST_GAME_ID", "SEED") as Game;

  game.turnPlayer = "player_one";
  game.priorityPlayer = "player_one";

  prepareGame("player_one", playerState, game);
  prepareGame("player_two", opponentState, game);

  return JSON.parse(JSON.stringify(game));
}
