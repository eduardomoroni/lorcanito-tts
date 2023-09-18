/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { dingleHopper } from "~/engine/cards/TFC/items";
import { oneJumpAhead } from "~/engine/cards/TFC/songs";

describe("One Jump Ahead", () => {
  it("Adds card from hand to inkwell", () => {
    const testStore = new TestStore({
      inkwell: oneJumpAhead.cost,
      hand: [dingleHopper, oneJumpAhead],
    });
    const store = testStore.store;
    const tableStore = store.tableStore;

    const cardUnderTest = testStore.getByZoneAndId("hand", oneJumpAhead.id);

    cardUnderTest.playFromHand();

    const effect = store.stackLayerStore.layers[0];
    if (effect) {
      const target = testStore.getByZoneAndId("hand", dingleHopper.id);

      store.stackLayerStore.resolveLayer(effect.id, {
        targetId: target.instanceId,
      });
    }

    expect(
      tableStore.getPlayerZone("player_one", "inkwell")?.cards
    ).toHaveLength(oneJumpAhead.cost + 1);
    expect(tableStore.getPlayerZone("player_one", "hand")?.cards).toHaveLength(
      0
    );
    expect(store.stackLayerStore.layers).toHaveLength(0);
  });
});
