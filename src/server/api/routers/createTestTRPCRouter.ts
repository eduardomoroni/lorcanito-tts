import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import {
  gameBeforeAlterHand,
  type Dependencies,
  MobXRootStore,
  type Game,
} from "@lorcanito/engine";
function createTestTRPCContext(
  game: Game = gameBeforeAlterHand,
  playerId = "player_one",
) {
  const deps: Dependencies = {
    playerId: playerId,
    logger: console,
    notifier: {
      sendNotification: console.log,
      clearNotification: console.log,
      clearAllNotifications: console.log,
    },
    modals: {
      openYesOrNoModal: console.log,
      openTargetModal: console.log,
      openScryModal: console.log,
    },
  };

  const user = {
    id: "id",
    uid: playerId,
    email: "email",
    customToken: "customToken",
  };

  const jwt = {
    user: user,
    customToken: "string",
  };

  const session = {
    user: user,
    // expires: ISODateString;
    customToken: "string",
    refreshToken: "string",
    token: jwt,
    expires: "string",
  };

  return createInnerTRPCContext({
    session,
    store: new MobXRootStore(game, deps, false),
  });
}

export function createTestTRPCRouter(game?: Game, playerId = "player_one") {
  const ctx = createTestTRPCContext(game, playerId);
  return appRouter.createCaller({ ...ctx });
}
