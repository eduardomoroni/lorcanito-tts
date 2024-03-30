/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  bashfulHopelessRomantic,
  happyGoodNatured,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Bashful - Hopeless Romantic", () => {
  it("**OH, GOSH** This character can't quest unless you have another Seven Dwarfs character in play.", () => {
    const testStore = new TestStore({
      inkwell: happyGoodNatured.cost,
      hand: [happyGoodNatured],
      play: [bashfulHopelessRomantic],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      bashfulHopelessRomantic.id,
    );
    const dwarf = testStore.getByZoneAndId("hand", happyGoodNatured.id);

    expect(cardUnderTest.hasQuestRestriction).toEqual(true);
    dwarf.playFromHand();
    expect(cardUnderTest.hasQuestRestriction).toEqual(false);
  });
});
