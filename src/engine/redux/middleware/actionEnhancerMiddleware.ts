import type { Middleware } from "@reduxjs/toolkit";
import { replaceGame, tick } from "~/engine/redux/reducer/gameReducer";

export function createSpectatorMiddleware(playerId: string) {
  const middleware: Middleware = (store) => (next) => (action) => {
    if (replaceGame.match(action)) {
      return next(action);
    } else if (store.getState().game.tables[playerId]) {
      return next(action);
    }
  };

  return middleware;
}
