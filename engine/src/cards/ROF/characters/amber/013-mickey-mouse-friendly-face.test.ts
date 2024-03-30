/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { mickeyMouseFriendlyFace } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Mickey Mouse - Friendly Face", () => {
  it("**GLAD YOU’RE HERE!** Whenever this character quests, you pay 3 ⬡ less for the next character you play this turn.", () => {
    const testStore = new TestStore({
      inkwell: mickeyMouseFriendlyFace.cost,
      hand: [mickeyMouseFriendlyFace],
      play: [mickeyMouseFriendlyFace],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      mickeyMouseFriendlyFace.id,
    );

    const target = testStore.getByZoneAndId("hand", mickeyMouseFriendlyFace.id);

    const expectedInkAvailable = mickeyMouseFriendlyFace.cost - 3;

    cardUnderTest.quest();

    target.playFromHand();
    expect(testStore.store.tableStore.getTable().inkAvailable()).toEqual(
      expectedInkAvailable,
    );
  });
});
