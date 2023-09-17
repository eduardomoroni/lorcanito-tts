/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { liloMakingAWish, peterPanNeverLanding } from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { lantern } from "~/engine/cards/TFC/items";

describe("Lantern", () => {
  it("Birthday Lights - You pay 1 ⬡ less for the next character you play this turn.", () => {
    const testStore = new TestStore({
      inkwell: 3, // Lilo costs 0 and peter pan costs 3
      hand: [peterPanNeverLanding, liloMakingAWish],
      play: [lantern],
    });

    const reducedCostChar = testStore.getByZoneAndId(
      "hand",
      liloMakingAWish.id
    );
    const normalCost = testStore.getByZoneAndId(
      "hand",
      peterPanNeverLanding.id
    );

    const cardUnderTest = testStore.getByZoneAndId("play", lantern.id);
    cardUnderTest.activate();

    reducedCostChar.playFromHand();

    expect(testStore.store.tableStore.getTable().inkAvailable()).toEqual(3);
    expect(reducedCostChar.zone).toEqual("play");

    normalCost.playFromHand();

    expect(testStore.store.tableStore.getTable().inkAvailable()).toEqual(0);
    expect(reducedCostChar.zone).toEqual("play");
  });
});
