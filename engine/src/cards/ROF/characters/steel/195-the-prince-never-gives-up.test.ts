/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { thePrinceNeverGivesUp } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("The Prince- Never Gives Up", () => {
  it("Bodyguard", () => {
    const testStore = new TestStore({
      play: [thePrinceNeverGivesUp],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      thePrinceNeverGivesUp.id,
    );

    expect(cardUnderTest.hasBodyguard).toBe(true);
  });

  it("Resist 1", () => {
    const testStore = new TestStore({
      play: [thePrinceNeverGivesUp],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      thePrinceNeverGivesUp.id,
    );

    expect(cardUnderTest.hasResist).toBe(true);
  });
});
