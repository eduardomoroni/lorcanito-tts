/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { dingleHopper } from "@lorcanito/engine/cards/TFC/items/items";
import { beastHardheaded } from "@lorcanito/engine/cards/TFC/characters/characters";

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

    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
  });
});
