/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { moanaOfMotunui } from "~/engine/cards/TFC";
import { workTogether } from "~/engine/cards/TFC/actions";

describe("Work Together", () => {
  it("Chosen character gains **Support** this turn.", () => {
    const testStore = new TestStore({
      inkwell: workTogether.cost,
      hand: [workTogether],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", workTogether.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.hasSupport).toEqual(true);
  });
});
