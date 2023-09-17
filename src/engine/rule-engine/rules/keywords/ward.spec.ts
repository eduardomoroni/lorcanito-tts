/**
 * @jest-environment node
 */
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { donaldDuckStruttingHisStuff } from "~/engine/cards/TFC";
import { plasmaBlaster } from "~/engine/cards/TFC/items";
import { expect } from "@jest/globals";

describe("Ward keyword", () => {
  it("Cannot target", () => {
    const testStore = new TestStore(
      {
        play: [plasmaBlaster],
        inkwell: 2,
      },
      {
        play: [donaldDuckStruttingHisStuff],
      }
    );

    const blaster = testStore.getByZoneAndId("play", plasmaBlaster.id);
    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      donaldDuckStruttingHisStuff.id,
      "player_two"
    );

    blaster.activate();

    const effect = testStore.store.stackLayerStore.layers[0];
    if (effect) {
      testStore.store.stackLayerStore.resolveAbility(effect.id, {
        targetId: cardUnderTest.instanceId,
      });
    }

    expect(cardUnderTest.meta.damage).toBeFalsy();

    // Effect doesn't resolve, letting the opponent to choose another target
    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);
  });
});
