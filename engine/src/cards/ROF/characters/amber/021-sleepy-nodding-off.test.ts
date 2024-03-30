/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { sleepyNoddingOff } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Sleepy - Nodding Off", () => {
  it("**YAWN!** This character enters play exerted.", () => {
    const testStore = new TestStore({
      inkwell: sleepyNoddingOff.cost,
      hand: [sleepyNoddingOff],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", sleepyNoddingOff.id);

    cardUnderTest.playFromHand();
    expect(cardUnderTest.ready).toEqual(false);
  });
});
