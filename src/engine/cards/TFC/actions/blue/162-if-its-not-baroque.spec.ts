/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { ifItsNotBaroque } from "~/engine/cards/TFC/actions/actions";
import { shieldOfVirtue } from "~/engine/cards/TFC/items/items";

describe("If it's Not Baroque", () => {
  it("Return item from discard.", () => {
    const testStore = new TestStore({
      inkwell: ifItsNotBaroque.cost,
      hand: [ifItsNotBaroque],
      discard: [shieldOfVirtue],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", ifItsNotBaroque.id);
    const target = testStore.getByZoneAndId("discard", shieldOfVirtue.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, discard: 1, play: 0 }),
    );
  });
});
