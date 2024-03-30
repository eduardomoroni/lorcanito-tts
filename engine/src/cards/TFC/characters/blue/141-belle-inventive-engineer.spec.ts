/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { lantern } from "@lorcanito/engine/cards/TFC/items/items";
import { belleInventive } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Belle - Inventive Engineer", () => {
  it("**TINKER** Whenever this character quests, you pay 1 ⬡ less for the next item you play this turn.", () => {
    const testStore = new TestStore({
      inkwell: lantern.cost - 1,
      hand: [lantern],
      play: [belleInventive],
    });

    const reducedCostItem = testStore.getByZoneAndId("hand", lantern.id);

    const cardUnderTest = testStore.getByZoneAndId("play", belleInventive.id);
    cardUnderTest.quest();

    reducedCostItem.playFromHand();

    expect(testStore.store.tableStore.getTable().inkAvailable()).toEqual(0);
    expect(reducedCostItem.zone).toEqual("play");
  });
});
