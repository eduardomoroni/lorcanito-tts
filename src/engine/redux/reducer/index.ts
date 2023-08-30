import { combineReducers, type Reducer } from "@reduxjs/toolkit";
import gameReducer from "~/engine/redux/reducer/gameReducer";
import gameContextReducer from "~/engine/redux/reducer/contextReducer";

export const rootReducer: Reducer = combineReducers({
  game: gameReducer,
  context: gameContextReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
