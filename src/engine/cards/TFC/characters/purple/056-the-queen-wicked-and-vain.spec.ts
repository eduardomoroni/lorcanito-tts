/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { youHaveForgottenMe } from "~/engine/cards/TFC/actions/actions";
import {maleficentSorceress, theQueenWickedAndVain} from "~/engine/cards/TFC/characters/characters";

describe("The Queen - Wicked and Vain", () => {
  it("**I SUMMON THEE** ↷ − Draw a card.", () => {
    const testStore = new TestStore({
      deck: [youHaveForgottenMe],
      play: [theQueenWickedAndVain],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      theQueenWickedAndVain.id,
    );

    cardUnderTest.activate();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, play: 1, discard: 0 }),
    );
  });
});
