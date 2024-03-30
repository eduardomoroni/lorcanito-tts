/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  gumboPot,
  mauricesWorkshop,
  weightSet,
} from "@lorcanito/engine/cards/ROF/items/items";

describe("Maurice's Workshop", () => {
  it("**LOOKING FOR THIS?** Whenever you play another item, you may pay 1 ⬡ to draw a card.", () => {
    const testStore = new TestStore({
      inkwell: mauricesWorkshop.cost + gumboPot.cost + 1,
      hand: [mauricesWorkshop, gumboPot],
      deck: 3,
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", mauricesWorkshop.id);
    const target = testStore.getByZoneAndId("hand", gumboPot.id);

    cardUnderTest.playFromHand();
    expect(testStore.stackLayers).toHaveLength(0);

    target.playFromHand();
    testStore.resolveOptionalAbility();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        deck: 2,
        hand: 1,
      }),
    );
  });
});
