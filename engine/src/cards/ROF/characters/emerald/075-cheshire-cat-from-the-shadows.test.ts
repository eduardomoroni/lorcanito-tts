/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  cheshireCatFromTheShadows,
  goofyKnightForADay,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Cheshire Cat - From the Shadows", () => {
  it("Shift", () => {
    const testStore = new TestStore({
      inkwell: cheshireCatFromTheShadows.cost,
      play: [cheshireCatFromTheShadows],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cheshireCatFromTheShadows.id,
    );

    expect(cardUnderTest.hasShift).toBeTruthy();
  });

  it("Evasive", () => {
    const testStore = new TestStore({
      inkwell: cheshireCatFromTheShadows.cost,
      play: [cheshireCatFromTheShadows],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cheshireCatFromTheShadows.id,
    );

    expect(cardUnderTest.hasEvasive).toBeTruthy();
  });

  it("**WICKED SMILE** ↷ − Banish chosen damaged character.", () => {
    const testStore = new TestStore(
      {
        inkwell: cheshireCatFromTheShadows.cost,
        play: [cheshireCatFromTheShadows],
      },
      {
        play: [goofyKnightForADay],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cheshireCatFromTheShadows.id,
    );
    const target = testStore.getByZoneAndId(
      "play",
      goofyKnightForADay.id,
      "player_two",
    );

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.zone).toEqual("discard");
  });
});
