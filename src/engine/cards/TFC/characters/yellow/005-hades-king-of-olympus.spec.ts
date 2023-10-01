/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {
  hadesKingOfOlympus,
  maleficentUninvited,
  scarFieryUsurper,
} from "~/engine/cards/TFC/characters/characters";

describe("Hades - King of Olympus", () => {
  it("**Sinister plot** This character gets +1 ◆ for every other Villain character you have in play.", () => {
    const testStore = new TestStore({
      inkwell: maleficentUninvited.cost + scarFieryUsurper.cost,
      hand: [maleficentUninvited, scarFieryUsurper],
      play: [hadesKingOfOlympus],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      hadesKingOfOlympus.id,
    );
    const targetCard = testStore.getByZoneAndId("hand", maleficentUninvited.id);
    const anotherCard = testStore.getByZoneAndId("hand", scarFieryUsurper.id);

    expect(cardUnderTest.strength).toEqual(6);

    targetCard.playFromHand();
    expect(cardUnderTest.strength).toEqual(7);

    anotherCard.playFromHand();
    expect(cardUnderTest.strength).toEqual(8);
  });

  it.skip("**Shift** 6 (_You may pay 6 ⬡ to play this on top of one of your characters named Hades._)", () => {});
});
