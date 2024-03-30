/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { sendTRPCGame } from "~/libs/3rd-party/firebase/database/game";
import {
  gameBeforeAlterHand,
  type Dependencies,
  MobXRootStore,
  type Game,
} from "@lorcanito/engine";
import { createTestTRPCRouter } from "~/server/api/routers/createTestTRPCRouter";

jest.mock("../../../libs/3rd-party/firebase/database/game");

const playerId = "player_one";

(sendTRPCGame as jest.Mock).mockImplementation((game: Game) => {
  return game;
});

describe("TRPC Moves", () => {
  describe("Alter Hand", () => {
    it.failing("should change table to ready to start", async () => {
      const { moves } = createTestTRPCRouter(gameBeforeAlterHand);

      expect(gameBeforeAlterHand.tables[playerId]?.readyToStart).toEqual(false);

      const game = await moves.alterHand({
        gameId: "gameId",
        cardsToMulligan: [],
      });

      expect(game.tables[playerId]?.readyToStart).toEqual(true);
      expect(sendTRPCGame).toHaveBeenCalled();
    });

    it.failing(
      "should change game status to started once both players alter hand",
      async () => {
        const mockGame: Game = JSON.parse(JSON.stringify(gameBeforeAlterHand));

        if (mockGame.tables["player_two"]) {
          mockGame.tables["player_two"].readyToStart = true;
        } else {
          throw new Error("Player Two Table not found");
        }

        const { moves } = createTestTRPCRouter(mockGame);

        expect(mockGame.tables[playerId]?.readyToStart).toEqual(false);

        const game = await moves.alterHand({
          gameId: "gameId",
          cardsToMulligan: [],
        });

        expect(game.tables[playerId]?.readyToStart).toEqual(true);
        expect(
          new MobXRootStore(game, {} as Dependencies, false).gameHasStarted(),
        ).toEqual(true);
      },
    );

    it.failing("should replace cards and shuffle the deck", async () => {
      const { moves } = createTestTRPCRouter(gameBeforeAlterHand, playerId);

      const beforeAlterHand = [
        "m4j0fi2hw2ywnp71e8jt19rk",
        "bupxiv1cvcu21rdlb8jxw6q3",
        "eezf7mxb4xxrfc4rdrro2qj7",
        "zs0sywgsk76l1usnf13yf1my",
        "nnr8offv1fe9icoawkbb4txr",
        "e0iz0xprobespymapk4t5bu9",
        "gkbskfzfudp1vx8id34m4kbf",
      ];
      const cardsToMulligan = [
        "bupxiv1cvcu21rdlb8jxw6q3",
        "zs0sywgsk76l1usnf13yf1my",
        "e0iz0xprobespymapk4t5bu9",
      ];
      expect(gameBeforeAlterHand.tables[playerId]?.zones.hand).toEqual(
        beforeAlterHand,
      );

      const game = await moves.alterHand({
        gameId: "gameId",
        cardsToMulligan: cardsToMulligan,
      });

      const table = game.tables[playerId];
      if (!table) {
        throw new Error("Player Table not found");
      } else {
        expect(table.zones.hand).not.toContain(cardsToMulligan);
        cardsToMulligan.forEach((card) => {
          expect(table.zones.deck).toContain(card);
        });
      }
    });
  });
});
