/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { minnieMouseWideEyedDiver } from "@lorcanito/engine/cards/ROF/characters/characters";
import { grabYourSword } from "@lorcanito/engine/cards/TFC/songs/songs";
import { fourDozenEggs } from "@lorcanito/engine/cards/ROF/actions/actions";
import { tangle } from "@lorcanito/engine/cards/TFC/actions/actions";

describe("Minnie Mouse - Wide-Eyed Diver", () => {
  it("Shift", () => {
    const testStore = new TestStore({
      play: [minnieMouseWideEyedDiver],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      minnieMouseWideEyedDiver.id,
    );

    expect(cardUnderTest.hasShift).toBe(true);
  });

  it("Evasive", () => {
    const testStore = new TestStore({
      play: [minnieMouseWideEyedDiver],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      minnieMouseWideEyedDiver.id,
    );

    expect(cardUnderTest.hasEvasive).toBe(true);
  });

  it("**UNDERSEA ADVENTURE** Whenever you play a second action in a turn, this character gets +2 ◆ this turn.", () => {
    const testStore = new TestStore({
      inkwell: grabYourSword.cost + fourDozenEggs.cost + tangle.cost,
      hand: [grabYourSword, fourDozenEggs, tangle],
      play: [minnieMouseWideEyedDiver],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      minnieMouseWideEyedDiver.id,
    );
    const actionOne = testStore.getByZoneAndId("hand", grabYourSword.id);
    const actionTwo = testStore.getByZoneAndId("hand", fourDozenEggs.id);
    const actionThree = testStore.getByZoneAndId("hand", tangle.id);

    actionOne.playFromHand();
    expect(cardUnderTest.lore).toBe(minnieMouseWideEyedDiver.lore);

    actionTwo.playFromHand();
    expect(cardUnderTest.lore).toBe(minnieMouseWideEyedDiver.lore + 2);

    actionThree.playFromHand();
    expect(cardUnderTest.lore).toBe(minnieMouseWideEyedDiver.lore + 2);
  });
});
