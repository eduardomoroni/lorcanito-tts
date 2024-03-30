/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  dingleHopper,
  plasmaBlaster,
} from "@lorcanito/engine/cards/TFC/items/items";
import { mickeyMouseTrueFriend } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Plasma Blaster", () => {
  it("Quick shot - Deal 1 damage to chosen character.", () => {
    const testStore = new TestStore({
      play: [plasmaBlaster, mickeyMouseTrueFriend],
      inkwell: [dingleHopper, dingleHopper],
    });

    const damagedChar = testStore.getByZoneAndId(
      "play",
      mickeyMouseTrueFriend.id,
    );
    damagedChar.updateCardMeta({ damage: 1 });
    expect(damagedChar.meta).toEqual(expect.objectContaining({ damage: 1 }));

    const cardUnderTest = testStore.getByZoneAndId("play", plasmaBlaster.id);

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    cardUnderTest.activate();
    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);

    const effect = testStore.store.stackLayerStore.layers[0];
    if (effect) {
      testStore.resolveTopOfStack({
        targets: [damagedChar],
      });
    }

    expect(damagedChar.meta).toEqual(expect.objectContaining({ damage: 2 }));
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
  });
});
