/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { youCanFly } from "@lorcanito/engine/cards/ROF/actions/actions";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("You Can Fly", () => {
  it("Chosen character gains **Evasive** until the start of your next turn.", () => {
    const testStore = new TestStore({
      inkwell: youCanFly.cost,
      hand: [youCanFly],
      play: [goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", youCanFly.id);
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);

    expect(target.hasEvasive).toBe(false);
    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });
    expect(target.hasEvasive).toBe(true);
  });
});
