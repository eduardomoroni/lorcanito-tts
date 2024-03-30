/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { peteBadGuy } from "@lorcanito/engine/cards/ROF/characters/characters";
import {
  nothingToHide,
  zeroToHero,
} from "@lorcanito/engine/cards/ROF/actions/actions";

describe("Pete - Bad Guy", () => {
  it("Ward", () => {
    const testStore = new TestStore({
      play: [peteBadGuy],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", peteBadGuy.id);
    expect(cardUnderTest.hasWard).toBe(true);
  });

  it("**TAKE THAT!** Whenever you play an action, this character gets +2 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: nothingToHide.cost + zeroToHero.cost,
      hand: [nothingToHide, zeroToHero],
      play: [peteBadGuy],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", peteBadGuy.id);

    const actionOne = testStore.getByZoneAndId("hand", nothingToHide.id);
    actionOne.playFromHand();
    expect(cardUnderTest.strength).toBe(peteBadGuy.strength + 2);

    const actionTwo = testStore.getByZoneAndId("hand", zeroToHero.id);
    actionTwo.playFromHand();
    expect(cardUnderTest.strength).toBe(peteBadGuy.strength + 4);

    // "**WHO'S NEXT** While this character has 7 ※ or more, he gets +2 ◆."
    expect(cardUnderTest.lore).toBe(peteBadGuy.lore + 2);
  });
});
