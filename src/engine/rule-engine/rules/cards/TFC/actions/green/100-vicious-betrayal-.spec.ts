/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { moanaOfMotunui, teKaTheBurningOne } from "~/engine/cards/TFC";
import { viciousBetrayal } from "~/engine/cards/TFC/actions";

describe("Vicious Betrayal", () => {
  it("[Non Villain] Chosen character gets +2 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: viciousBetrayal.cost,
      hand: [viciousBetrayal],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", viciousBetrayal.id);
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) + 2);
  });

  it("[Villain] Chosen character gets +2 ※ this turn.", () => {
    const testStore = new TestStore({
      inkwell: viciousBetrayal.cost,
      hand: [viciousBetrayal],
      play: [teKaTheBurningOne],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", viciousBetrayal.id);
    const target = testStore.getByZoneAndId("play", teKaTheBurningOne.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual((target.lorcanitoCard.strength || 0) + 3);
  });
});
