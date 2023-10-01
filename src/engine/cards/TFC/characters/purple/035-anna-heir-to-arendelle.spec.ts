/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { annaHeirToArendelle } from "~/engine/cards/TFC/characters/characters";

xdescribe("Anna - Heir to Arendelle", () => {
  it("**LOVING HEART** When you play this character, if you have a character named Elsa in play, choose an opposing character. The chosen character doesn't ready at the start of their next turn.", () => {
    const testStore = new TestStore({
      play: [annaHeirToArendelle],
    });
  });
});
