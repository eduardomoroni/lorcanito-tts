/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { tiggerOneOfAKind } from "@lorcanito/engine/cards/ROF/characters/characters";
import {
  nothingToHide,
  zeroToHero,
} from "@lorcanito/engine/cards/ROF/actions/actions";

describe("Tigger - One of a Kind", () => {
  it("**ENERGETIC** Whenever you play an action, this character gets +2 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: nothingToHide.cost + zeroToHero.cost,
      hand: [nothingToHide, zeroToHero],
      play: [tiggerOneOfAKind],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", tiggerOneOfAKind.id);

    const actionOne = testStore.getByZoneAndId("hand", nothingToHide.id);
    actionOne.playFromHand();
    expect(cardUnderTest.strength).toBe(tiggerOneOfAKind.strength + 2);

    const actionTwo = testStore.getByZoneAndId("hand", zeroToHero.id);
    actionTwo.playFromHand();
    expect(cardUnderTest.strength).toBe(tiggerOneOfAKind.strength + 4);
  });
});
