import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "~/engine/redux/reducer";
import { listenerMiddleware } from "~/engine/redux/middleware/listenerMiddleware";
import gameReducer from "~/engine/redux/reducer/gameReducer";
import gameContextReducer from "~/engine/redux/reducer/contextReducer";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    context: gameContextReducer,
  },
  // Add the listener middleware to the store.
  // NOTE: Since this can receive actions with functions inside,
  // it should go before the serializability check middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
