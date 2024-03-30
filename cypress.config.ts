import "dotenv/config";
import { defineConfig } from "cypress";
import { createGame, getGame } from "~/libs/3rd-party/firebase/database/game";
import type { Game } from "@lorcanito/engine";
import { createTestTRPCRouter } from "~/server/api/routers/createTestTRPCRouter";

export default defineConfig({
  // Please create a file "./cypress.env.json" and add the env vars
  // env: env,
  e2e: {
    baseUrl: "http://localhost:3000",
    chromeWebSecurity: false,
    experimentalStudio: true,
    viewportHeight: 768,
    viewportWidth: 1024,
    setupNodeEvents(on, config) {
      // implement node event listeners here

      on("task", {
        async makeAMove(params: {
          gameId: string;
          move: "ALTER_HAND";
          cardsToMulligan: string[];
        }) {
          const gameId = params.gameId;
          const game = await getGame(gameId);

          if (!game) {
            throw new Error("Game not found");
          }

          const router = createTestTRPCRouter(game, "player_two");

          if (params.move === "ALTER_HAND") {
            return await router.moves.alterHand({
              gameId: gameId,
              cardsToMulligan: [],
            });
          }

          return null;
        },
        async createGame(params: {
          gameId?: string;
          game: Game;
          userId: string;
        }) {
          try {
            replacePlayerId(params.game, params.userId);
            return await createGame(
              params.gameId || "TEST_GAME_ID",
              params.game,
            );
          } catch (e) {
            console.error(e);
          }
        },
      });
    },
  },
});

function replacePlayerId(game: Game, playerId: string) {
  // recursively iterates every key and value of this object replacing the string "player_one" by the playerId
  const replacePlayerId = (obj: Game) => {
    const tobeReplaced = "player_one";

    if (!obj) {
      console.error("obj is null", obj);
      return obj;
    }

    Object.keys(obj).forEach((key) => {
      if (key === tobeReplaced) {
        obj[playerId] = obj[tobeReplaced];
        delete obj[tobeReplaced];
        key = playerId;
      }

      if (typeof obj[key] === "object" && obj[key] !== null) {
        replacePlayerId(obj[key]);
      } else if (obj[key] === tobeReplaced) {
        obj[key] = playerId;
      }
    });

    return game;
  };

  return replacePlayerId(game);
}
