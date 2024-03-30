/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { magicGoldenFlower } from "@lorcanito/engine/cards/TFC/items/items";
import { arielOnHumanLegs } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Magic Golden Flower", () => {
  it("Healing Pollen - healing 3 damage", () => {
    const testStore = new TestStore({
      play: [magicGoldenFlower, arielOnHumanLegs],
    });

    const damagedChar = testStore.getByZoneAndId("play", arielOnHumanLegs.id);
    damagedChar.updateCardMeta({ damage: 3 });
    expect(damagedChar.meta).toEqual(expect.objectContaining({ damage: 3 }));

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      magicGoldenFlower.id,
    );

    cardUnderTest.activate();

    testStore.resolveTopOfStack({
      targetId: damagedChar.instanceId,
    });

    expect(damagedChar.meta).toEqual(expect.objectContaining({ damage: 0 }));
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        play: 1,
        discard: 1,
      }),
    );
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
  });

  it("Can undo", () => {
    // TODO: implement undo
    expect(true).toBe(true);
  });
});
