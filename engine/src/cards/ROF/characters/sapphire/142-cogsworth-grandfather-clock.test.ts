/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { cogsworthGrandfatherClock } from "@lorcanito/engine/cards/ROF/characters/characters";
import {
  megaraPullingTheStrings,
  mickeyMouseTrueFriend,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Cogsworth - Grandfather Clock", () => {
  it("Shift", () => {
    const testStore = new TestStore({
      play: [cogsworthGrandfatherClock],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cogsworthGrandfatherClock.id,
    );

    expect(cardUnderTest.hasShift).toBeTruthy();
  });

  it("Ward", () => {
    const testStore = new TestStore({
      play: [cogsworthGrandfatherClock],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cogsworthGrandfatherClock.id,
    );

    expect(cardUnderTest.hasWard).toBeTruthy();
  });

  describe("**UNWIND** Your other characters gain **Resist** +1 _(Damage dealt to them is reduced by 1.)_", () => {
    it("Other characters gain Resist", () => {
      const testStore = new TestStore({
        play: [
          megaraPullingTheStrings,
          mickeyMouseTrueFriend,
          cogsworthGrandfatherClock,
        ],
      });

      const target = testStore.getByZoneAndId(
        "play",
        megaraPullingTheStrings.id,
      );
      const anotherTarget = testStore.getByZoneAndId(
        "play",
        mickeyMouseTrueFriend.id,
      );

      expect(target.hasResist).toEqual(true);
      expect(anotherTarget.hasResist).toEqual(true);
    });

    it("Cogsworth himself doesn't have ward", () => {
      const testStore = new TestStore({
        play: [cogsworthGrandfatherClock],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        cogsworthGrandfatherClock.id,
      );

      expect(cardUnderTest.hasResist).toEqual(false);
    });

    it("Two Cogsworths give ward to one another", () => {
      const testStore = new TestStore({
        play: [cogsworthGrandfatherClock, cogsworthGrandfatherClock],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        cogsworthGrandfatherClock.id,
      );

      expect(cardUnderTest.hasResist).toEqual(true);
    });
  });
});
