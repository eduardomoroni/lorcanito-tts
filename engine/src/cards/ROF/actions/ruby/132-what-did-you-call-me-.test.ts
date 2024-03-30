/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { whatDidYouCallMe } from "@lorcanito/engine/cards/ROF/actions/actions";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("What did you call me?", () => {
  it("[NON DAMAGED] Chosen damaged character gets +3 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: whatDidYouCallMe.cost,
      hand: [whatDidYouCallMe],
      play: [goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", whatDidYouCallMe.id);
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.strength).toBe(goofyKnightForADay.strength);
  });

  it("Chosen damaged character gets +3 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: whatDidYouCallMe.cost,
      hand: [whatDidYouCallMe],
      play: [goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", whatDidYouCallMe.id);
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);
    target.updateCardDamage(1);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.strength).toBe(goofyKnightForADay.strength + 3);
  });
});
