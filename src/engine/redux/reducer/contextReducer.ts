import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { passTurn, playCardFromHand } from "~/engine/redux/reducer/gameReducer";
import { LorcanitoGameState } from "~/engine/rule-engine/lorcana/types";
import type { Engine } from "~/engine/rule-engine/engine";

export type GameContext = {
  seed: string;
  phase: "alter_hand" | "play";
};

export const initialState: GameContext = {
  seed: "INITIAL_GAME",
  phase: "alter_hand",
};

export const gameContext = createSlice({
  name: "game",
  initialState,
  reducers: {
    setPhase(state, action: PayloadAction<"alter_hand" | "play">) {
      state.phase = action.payload;
    },
    chooseTransientMode(
      state,
      action: PayloadAction<{
        callback: "playCardFromHand";
        callbackArgs: Parameters<Engine["moves"]["playCardFromHand"]>;
        stage: "yes_or_no";
        title: string;
        text: string;
      }>
    ) {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(passTurn, (state, action) => {})
      .addDefaultCase((state, action) => {});
  },
});

function getNextPlayer(G: LorcanitoGameState, playerId: string) {
  const players = Object.keys(G.tables);
  const next = (players.findIndex((p) => p === playerId) + 1) % players.length;

  return players[next] || playerId;
}

// Action creators are generated for each case reducer function
export const { setPhase, chooseTransientMode } = gameContext.actions;

export default gameContext.reducer;
