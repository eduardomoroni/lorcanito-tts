/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { flotsamUrsulaSpy } from "~/engine/cards/TFC/characters/characters";

xdescribe("Tinker Bell - Peter Pan's Ally", () => {
  it("**LOYAL AND DEVOTED** Your characters named Peter Pan gain **Challenger +1.** _(They get +1 ※ while challenging.)_", () => {
    const testStore = new TestStore({
      play: [flotsamUrsulaSpy],
    });
  });
});
