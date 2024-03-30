/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { donaldDuckNotAgain } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Donald Duck - Not Again!", () => {
  it("Evasive", () => {
    const testStore = new TestStore({
      inkwell: donaldDuckNotAgain.cost,
      play: [donaldDuckNotAgain],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      donaldDuckNotAgain.id,
    );

    expect(cardUnderTest.hasEvasive).toBe(true);
  });

  it.todo("**PHOOEY!** This character gets +1 ◆ for each 1 damage on him.");
});
