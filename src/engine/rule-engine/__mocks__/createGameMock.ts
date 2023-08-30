import { createEmptyGame, type Game } from "~/libs/game";
import type { Zones } from "~/providers/TabletopProvider";
import { createId } from "@paralleldrive/cuid2";
import type { LorcanitoCard } from "~/engine/cardTypes";

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type TestInitialState = PartialRecord<
  Zones,
  LorcanitoCard[] | undefined
>;

function prepareGame(playerId: string, state: TestInitialState, game: Game) {
  game.tables[playerId] = {
    lore: 0,
    readyToStart: true,
    zones: {
      discard: [],
      inkwell: [],
      deck: [],
      hand: [],
      play: [],
    },
  };

  Object.keys(state).forEach((zone) => {
    const zoneCards = state[zone as Zones];
    if (zoneCards) {
      zoneCards.forEach((card) => {
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
  opponentState: TestInitialState = {}
): Game {
  const game = createEmptyGame("TEST_GAME_ID") as Game;

  game.turnPlayer = "player_one";

  prepareGame("player_one", playerState, game);
  prepareGame("player_two", opponentState, game);

  return game;
}
