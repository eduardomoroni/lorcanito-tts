/**
 * @jest-environment node
 */
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { maleficentSorceress } from "@lorcanito/engine/cards/TFC/characters/characters";
import { youHaveForgottenMe } from "@lorcanito/engine/cards/TFC/actions/actions";
import { describe, it, expect } from "@jest/globals";

describe("Optional Abilities", () => {
  it("Auto Yes: When you play this character, you may draw a card.", () => {
    const testStore = new TestStore({
      inkwell: maleficentSorceress.cost,
      deck: [youHaveForgottenMe],
      hand: [maleficentSorceress],
    });
    testStore.store.configurationStore.autoAcceptOptionals = true;

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      maleficentSorceress.id,
    );

    cardUnderTest.playFromHand();

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, play: 1, discard: 0 }),
    );
  });
});
