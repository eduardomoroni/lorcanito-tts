/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { suddenChill } from "~/engine/cards/TFC/songs";
import { moanaOfMotunui } from "~/engine/cards/TFC";

describe("Sudden Chill", () => {
  it("Each opponent chooses and discards a card", () => {
    const testStore = new TestStore(
      {
        inkwell: suddenChill.cost,
        hand: [suddenChill],
      },
      { hand: [moanaOfMotunui] }
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", suddenChill.id);
    const target = testStore.getByZoneAndId(
      "hand",
      moanaOfMotunui.id,
      "player_two"
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({
      targetId: target.instanceId,
    });

    expect(target.zone).toEqual("discard");
  });
});
