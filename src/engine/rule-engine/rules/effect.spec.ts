/**
 * @jest-environment node
 */

import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { dingleHopper, fishboneQuill } from "~/engine/cards/TFC/items";
import { expect } from "@jest/globals";

it("Does NOT let player choose an invalid target for an effect", () => {
  const testStore = new TestStore({
    play: [fishboneQuill, dingleHopper],
  });
  const store = testStore.store;

  const cardUnderTest = testStore.getByZoneAndId("play", fishboneQuill.id);

  expect(testStore.getZonesCardCount()).toEqual(
    expect.objectContaining({
      inkwell: 0,
      hand: 0,
      play: 2,
    })
  );

  cardUnderTest.activate();

  const effect = store.stackLayerStore.layers[0];
  if (effect) {
    const target = testStore.getByZoneAndId("play", dingleHopper.id);

    // Fishbone quill requires a target from hand, but we're passing a target from play
    store.stackLayerStore.resolveLayer(effect.id, {
      targetId: target.instanceId,
    });
  }

  expect(testStore.getZonesCardCount()).toEqual(
    expect.objectContaining({
      inkwell: 0,
      hand: 0,
      play: 2,
    })
  );
  expect(store.stackLayerStore.layers).toHaveLength(1);
});
