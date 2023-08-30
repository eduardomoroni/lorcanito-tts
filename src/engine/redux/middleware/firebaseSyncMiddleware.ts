import type { Middleware } from "@reduxjs/toolkit";
import {
  convertDiffToRealTimeUpdates,
  getDiff,
} from "~/engine/rule-engine/lib/stateDiff";
import { type Database, ref, update } from "firebase/database";
import { replaceGame, tick } from "~/engine/redux/reducer/gameReducer";

export function createFirebaseSyncMiddleware(
  database: Database,
  gameId: string
) {
  const middleware: Middleware = (store) => (next) => (action) => {
    // Do not sync, when the action is to replace the game (e.g. when updating store from firebase)
    if (replaceGame.match(action)) {
      return next(action);
    }

    const prevState = store.getState();
    // This is to prevent out of order updates
    next(tick());
    const response = next(action);
    const nextState = store.getState();

    if (replaceGame.match(action)) {
      return response;
    }

    const difference = getDiff(prevState.game, nextState.game);
    console.log({ prevState, nextState, diff: difference });

    if (difference && prevState) {
      const updates = convertDiffToRealTimeUpdates(difference, nextState.game);
      console.log(updates);
      update(ref(database, `games/${gameId}`), updates);
    }

    return response;
  };

  return middleware;
}
