/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { partOfOurWorld } from "@lorcanito/engine/cards/TFC/songs/songs";
import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Part of Your World", () => {
  it("Return a character card from your discard to your hand.", () => {
    const testStore = new TestStore({
      inkwell: partOfOurWorld.cost,
      hand: [partOfOurWorld],
      discard: [moanaOfMotunui],
    });
    const cardUnderTest = testStore.getByZoneAndId("hand", partOfOurWorld.id);

    cardUnderTest.playFromHand();

    const target = testStore.getByZoneAndId("discard", moanaOfMotunui.id);

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
  });
});
