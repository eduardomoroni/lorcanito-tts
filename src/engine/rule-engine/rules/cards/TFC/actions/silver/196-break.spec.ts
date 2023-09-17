/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { breakAction, dragonFire } from "~/engine/cards/TFC/actions";
import { dingleHopper } from "~/engine/cards/TFC/items";

describe("Break", () => {
  it("Banish chosen item.", () => {
    const testStore = new TestStore({
      inkwell: dragonFire.cost,
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
