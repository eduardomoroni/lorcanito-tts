/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { breakAction } from "~/engine/cards/TFC/actions/actions";
import { dingleHopper } from "~/engine/cards/TFC/items/items";

describe("Break", () => {
  it("Banish chosen item.", () => {
    const testStore = new TestStore({
      inkwell: breakAction.cost,
      hand: [breakAction],
      play: [dingleHopper],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", breakAction.id);
    const target = testStore.getByZoneAndId("play", dingleHopper.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
  });
});
