/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { moanaOfMotunui } from "~/engine/cards/TFC";
import { hesGotASword } from "~/engine/cards/TFC/actions";

describe("He's Got a Sword!", () => {
  it("Chosen character gets +2 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: hesGotASword.cost,
      hand: [hesGotASword],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", hesGotASword.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) + 2);
  });
});
