/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { magicBroomBucketBrigade } from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { fireTheCannons } from "~/engine/cards/TFC/actions";

describe("Fire The Cannons!", () => {
  it("Deal 2 damage to chosen character", () => {
    const testStore = new TestStore({
      inkwell: fireTheCannons.cost,
      hand: [fireTheCannons],
      play: [magicBroomBucketBrigade],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", fireTheCannons.id);
    const target = testStore.getByZoneAndId("play", magicBroomBucketBrigade.id);
    target.updateCardMeta({ damage: 0 });
    expect(
      testStore.getByZoneAndId("play", magicBroomBucketBrigade.id).meta
    ).toEqual(expect.objectContaining({ damage: 0 }));

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(
      testStore.getByZoneAndId("play", magicBroomBucketBrigade.id).meta
    ).toEqual(expect.objectContaining({ damage: 2 }));
  });
});
