import { createListenerMiddleware } from "@reduxjs/toolkit";
import { selectAreAllPlayerReady } from "~/engine/rule-engine/lorcana/selectors";
import { setPhase } from "~/engine/redux/reducer/contextReducer";
import type { RootState } from "~/engine/redux/reducer";

// Create the middleware instance and methods
export const listenerMiddleware = createListenerMiddleware();

// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
listenerMiddleware.startListening({
  predicate: (_, currentState: RootState, prevState: RootState) => {
    return (
      selectAreAllPlayerReady(currentState) &&
      !selectAreAllPlayerReady(prevState)
    );
  },
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(setPhase("play"));
  },
});
