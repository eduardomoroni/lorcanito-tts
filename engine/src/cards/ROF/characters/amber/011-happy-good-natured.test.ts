/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { happyGoodNatured } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Happy - Good-Natured", () => {
  it("Support", () => {
    const testStore = new TestStore({
      play: [happyGoodNatured],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", happyGoodNatured.id);

    expect(cardUnderTest.hasSupport).toEqual(true);
  });
});
