/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { moanaOfMotunui } from "~/engine/cards/TFC";
import { dragonFire } from "~/engine/cards/TFC/actions";

describe("Dragon Fire", () => {
  it("Banish chosen character.", () => {
    const testStore = new TestStore({
      inkwell: dragonFire.cost,
      hand: [dragonFire],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", dragonFire.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
  });
});
