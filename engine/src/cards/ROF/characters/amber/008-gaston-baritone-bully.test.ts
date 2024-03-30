/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { gastonBaritoneBully } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Gaston - Baritone Bully", () => {
  it("Singer", () => {
    const testStore = new TestStore({
      inkwell: gastonBaritoneBully.cost,
      play: [gastonBaritoneBully],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      gastonBaritoneBully.id,
    );

    expect(cardUnderTest.hasSinger).toEqual(true);
  });
});
