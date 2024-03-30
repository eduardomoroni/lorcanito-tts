/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  theQueenDisguisedPeddler,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("The Queen - Disguised Peddler", () => {
  it("**A PERFECT DISGUISE** ↷, Choose and discard a character card − Gain lore equal to the discarded character's ◆.", () => {
    const testStore = new TestStore({
      play: [theQueenDisguisedPeddler],
      hand: [goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      theQueenDisguisedPeddler.id,
    );
    const target = testStore.getByZoneAndId("hand", goofyKnightForADay.id);

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.zone).toEqual("discard");
    expect(testStore.getPlayerLore()).toEqual(target.lore);
  });
});
