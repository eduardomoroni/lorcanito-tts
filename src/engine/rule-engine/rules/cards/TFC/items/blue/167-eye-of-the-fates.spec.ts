/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { eyeOfTheFate } from "~/engine/cards/TFC/items";
import { mickeyMouseTrueFriend } from "~/engine/cards/TFC";

describe("Eye of the Fates", () => {
  it("See the Future - Chosen character gets +1 ◆ this turn.", () => {
    const testStore = new TestStore({
      play: [eyeOfTheFate, mickeyMouseTrueFriend],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", eyeOfTheFate.id);
    const target = testStore.getByZoneAndId("play", mickeyMouseTrueFriend.id);
    const lore = target.lorcanitoCard.lore || 0;

    cardUnderTest.activate();

    expect(target.lore).toEqual(lore);
    testStore.resolveTopOfStack({ targetId: target.instanceId });
    expect(target.lore).toEqual((lore || 0) + 1);
  });
});
