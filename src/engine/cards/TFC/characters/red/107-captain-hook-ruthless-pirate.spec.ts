/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { starkeyHooksHenchman } from "~/engine/cards/TFC/characters/characters";

xdescribe("Captain Hook - Ruthless Pirate", () => {
  it("**YOU COWARD!** While this character is exerted, opposing characters with **Evasive** gain **Reckless**.", () => {
    const testStore = new TestStore({
      play: [starkeyHooksHenchman],
    });
  });
});
