/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { suddenChill } from "@lorcanito/engine/cards/TFC/songs/songs";
import { moanaOfMotunui } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Sudden Chill", () => {
  it("Each opponent chooses and discards a card", () => {
    const testStore = new TestStore(
      {
        inkwell: suddenChill.cost,
        hand: [suddenChill],
      },
      { hand: [moanaOfMotunui] },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", suddenChill.id);
    const target = testStore.getByZoneAndId(
      "hand",
      moanaOfMotunui.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
  });
});
