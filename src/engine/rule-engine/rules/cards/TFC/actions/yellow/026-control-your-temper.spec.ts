/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { mickeyMouseTrueFriend } from "~/engine/cards/TFC";
import { controlYourTemper } from "~/engine/cards/TFC/actions";

describe("Control Your Temper!", () => {
  it("Chosen characters gets -2 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: controlYourTemper.cost,
      hand: [controlYourTemper],
      play: [mickeyMouseTrueFriend],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      controlYourTemper.id
    );
    const target = testStore.getByZoneAndId("play", mickeyMouseTrueFriend.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) - 2);
  });
});
