/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { dingleHopper } from "~/engine/cards/TFC/items/items";

import {beastHardheaded} from "~/engine/cards/TFC/characters/characters";

describe("Beast - Hardheaded", () => {
  it("**DESTRUCTION** When you play this character, you may banish chosen item card.", () => {
    const testStore = new TestStore({
      inkwell: beastHardheaded.cost,
      hand: [beastHardheaded],
      play: [dingleHopper],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", beastHardheaded.id);
    const target = testStore.getByZoneAndId("play", dingleHopper.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
  });
});
