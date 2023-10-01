/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";

import {
  belleStrangeButBeautiful,
  dukeOfWeselton,
  goonsMaleficent,
  mickeyMouseTrueFriend,
} from "~/engine/cards/TFC/characters/characters";

describe("Belle - Strange but Special", () => {
  describe("DISARMING BEAUTY effect - Chosen characters gets -2 ※ this turn.", () => {
    it("One Belle in play", () => {
      const testStore = new TestStore({
        hand: [goonsMaleficent, dukeOfWeselton, mickeyMouseTrueFriend],
        play: [belleStrangeButBeautiful],
      });

      const target = testStore.getByZoneAndId("hand", goonsMaleficent.id);
      const anotherTarget = testStore.getByZoneAndId("hand", dukeOfWeselton.id);
      const thirdTarget = testStore.getByZoneAndId(
        "hand",
        mickeyMouseTrueFriend.id,
      );

      target.addToInkwell();
      anotherTarget.addToInkwell();
      thirdTarget.addToInkwell();

      expect(target.zone).toEqual("inkwell");
      expect(anotherTarget.zone).toEqual("inkwell");
      expect(thirdTarget.zone).toEqual("hand");
    });

    it("Two Belles in play", () => {
      const testStore = new TestStore({
        hand: [goonsMaleficent, dukeOfWeselton, mickeyMouseTrueFriend],
        play: [belleStrangeButBeautiful, belleStrangeButBeautiful],
      });

      const target = testStore.getByZoneAndId("hand", goonsMaleficent.id);
      const anotherTarget = testStore.getByZoneAndId("hand", dukeOfWeselton.id);
      const thirdTarget = testStore.getByZoneAndId(
        "hand",
        mickeyMouseTrueFriend.id,
      );

      target.addToInkwell();
      anotherTarget.addToInkwell();
      thirdTarget.addToInkwell();

      expect(target.zone).toEqual("inkwell");
      expect(anotherTarget.zone).toEqual("inkwell");
      expect(thirdTarget.zone).toEqual("inkwell");
    });
  });

  it("While you have 10 or more cards in your inkwell, this character gets +4 ◆.", () => {
    const testStore = new TestStore({
      inkwell: 9,
      hand: [goonsMaleficent],
      play: [belleStrangeButBeautiful],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      belleStrangeButBeautiful.id,
    );
    const target = testStore.getByZoneAndId("hand", goonsMaleficent.id);

    expect(cardUnderTest.lore).toEqual(1);
    target.addToInkwell();
    expect(cardUnderTest.lore).toEqual(5);
  });
});
