/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { flotsamUrsulaSpy } from "~/engine/cards/TFC/characters/characters";

xdescribe("Anna - Heir to Arendelle", () => {
  it("**DEXTEROUS LUNGE** Your characters named Jetsam gain **Rush.**", () => {
    const testStore = new TestStore({
      play: [flotsamUrsulaSpy],
    });
  });
});
