/**
 * @jest-environment node
 */

import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  dingleHopper,
  fishboneQuill,
} from "@lorcanito/engine/cards/TFC/items/items";
import { expect, it } from "@jest/globals";

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
    }),
  );

  cardUnderTest.activate();

  const effect = store.stackLayerStore.layers[0];
  if (effect) {
    const target = testStore.getByZoneAndId("play", dingleHopper.id);
    testStore.resolveTopOfStack(
      {
        targets: [target],
      },
      true,
    );
  }

  expect(testStore.getZonesCardCount()).toEqual(
    expect.objectContaining({
      inkwell: 0,
      hand: 0,
      play: 2,
    }),
  );
  expect(store.stackLayerStore.layers).toHaveLength(1);
});
