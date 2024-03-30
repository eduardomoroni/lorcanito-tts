/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { pawpsicle } from "@lorcanito/engine/cards/ROF/items/items";
import { cinderellaBallroomSensation } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Pawpsicle", () => {
  it("**JUMBO POP** When you play this item, you may draw a card.", () => {
    const testStore = new TestStore({
      inkwell: pawpsicle.cost,
      deck: 2,
      hand: [pawpsicle],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", pawpsicle.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 1, play: 1, discard: 0 }),
    );
  });

  it("**THAT'S REDWOOD** Banish this item − Remove up to 2 damage from chosen character.", () => {
    const testStore = new TestStore({
      play: [pawpsicle, cinderellaBallroomSensation],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", pawpsicle.id);
    const damagedChar = testStore.getByZoneAndId(
      "play",
      cinderellaBallroomSensation.id,
    );
    damagedChar.updateCardMeta({ damage: 2 });
    expect(damagedChar.meta).toEqual(expect.objectContaining({ damage: 2 }));

    cardUnderTest.activate();
    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);

    testStore.resolveTopOfStack({ targets: [damagedChar] });
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);

    expect(damagedChar.meta).toEqual(expect.objectContaining({ damage: 0 }));
  });
});
