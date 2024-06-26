/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { swordOfTruth } from "@lorcanito/engine/cards/TFC/items/items";
import { teKaTheBurningOne } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Sword of Truth", () => {
  it("**FINAL ENCHANTMENT** Banish this item − Banish chosen Villain character.", () => {
    const testStore = new TestStore({
      play: [swordOfTruth, teKaTheBurningOne],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", swordOfTruth.id);
    const target = testStore.getByZoneAndId("play", teKaTheBurningOne.id);

    cardUnderTest.activate();

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
    expect(cardUnderTest.zone).toEqual("discard");
  });
});
