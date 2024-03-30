/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { feliciaAlwaysHungry } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Felicia - Always Hungry", () => {
  it("Reckless", () => {
    const testStore = new TestStore({
      play: [feliciaAlwaysHungry],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      feliciaAlwaysHungry.id,
    );

    expect(cardUnderTest.hasReckless).toBe(true);
  });
});
