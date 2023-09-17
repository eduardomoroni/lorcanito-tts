/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { partOfOurWorld } from "~/engine/cards/TFC/songs";
import { moanaOfMotunui } from "~/engine/cards/TFC";

describe("Part of Your World", () => {
  it("Return a character card from your discard to your hand.", () => {
    const testStore = new TestStore({
      inkwell: partOfOurWorld.cost,
      hand: [partOfOurWorld],
      discard: [moanaOfMotunui],
    });
    const store = testStore.store;
    const tableStore = store.tableStore;

    const cardUnderTest = testStore.getByZoneAndId("hand", partOfOurWorld.id);

    cardUnderTest.playFromHand();

    const target = testStore.getByZoneAndId("discard", moanaOfMotunui.id);

    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("hand");
  });
});
