/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { youHaveForgottenMe } from "~/engine/cards/TFC/actions/actions";
import {maleficentSorceress} from "~/engine/cards/TFC/characters/characters";

describe("Maleficent - Sorceress", () => {
  it("**CAST MY SPELL** When you play this character, you may draw a card.", () => {
    const testStore = new TestStore({
      inkwell: maleficentSorceress.cost,
      deck: [youHaveForgottenMe],
      hand: [maleficentSorceress],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      maleficentSorceress.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, play: 1, discard: 0 }),
    );
  });
});
