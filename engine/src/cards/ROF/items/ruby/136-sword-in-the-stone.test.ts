/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { swordInTheStone } from "@lorcanito/engine/cards/ROF/items/items";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Sword In The Stone", () => {
  it("↷, 2 ⬡ - Chosen character gets +1 ※ this turn for each 1 damage on them.", () => {
    const testStore = new TestStore({
      inkwell: 2,
      play: [swordInTheStone, goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", swordInTheStone.id);
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);

    target.updateCardDamage(5);

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.strength).toEqual(goofyKnightForADay.strength + 5);
  });
});
