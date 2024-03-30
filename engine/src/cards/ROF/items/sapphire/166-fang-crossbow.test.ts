/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { fangCrossbow } from "@lorcanito/engine/cards/ROF/items/items";
import {
  madamMimPurpleDragon,
  theQueenRegalMonarch,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Fang Crossbow", () => {
  it("**CAREFUL AIM** ↷, 2 ⬡ – Chosen character gets -2 ※ this turn.", () => {
    const testStore = new TestStore(
      {
        inkwell: 2,
        play: [fangCrossbow, theQueenRegalMonarch],
      },
      { deck: 1 },
    );

    const cardUnderTest = testStore.getByZoneAndId("play", fangCrossbow.id);
    const target = testStore.getByZoneAndId("play", theQueenRegalMonarch.id);

    expect(target.strength).toEqual(theQueenRegalMonarch.strength);

    cardUnderTest.activate("Careful Aim");
    testStore.resolveTopOfStack({ targets: [target] });

    expect(cardUnderTest.ready).toEqual(false);
    expect(target.strength).toEqual(theQueenRegalMonarch.strength - 2);

    testStore.passTurn();

    expect(target.strength).toEqual(theQueenRegalMonarch.strength);
  });

  describe("**STAY BACK!** ↷, Banish this item – Banish chosen Dragon character.", () => {
    it("should banish a dragon", () => {
      const testStore = new TestStore({
        inkwell: fangCrossbow.cost,
        play: [fangCrossbow, madamMimPurpleDragon],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", fangCrossbow.id);
      const target = testStore.getByZoneAndId("play", madamMimPurpleDragon.id);

      cardUnderTest.activate("Stay Back!");
      testStore.resolveTopOfStack({ targets: [target] });

      expect(cardUnderTest.zone).toEqual("discard");
      expect(target.zone).toEqual("discard");
    });

    it("should NOT banish a NON-dragon", () => {
      const testStore = new TestStore({
        inkwell: fangCrossbow.cost,
        play: [fangCrossbow, theQueenRegalMonarch],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", fangCrossbow.id);
      const target = testStore.getByZoneAndId("play", theQueenRegalMonarch.id);

      cardUnderTest.activate("Stay Back!");
      testStore.resolveTopOfStack({ targets: [target] }, true);

      expect(cardUnderTest.zone).toEqual("discard");
      expect(target.zone).toEqual("play");
      expect(testStore.stackLayers).toHaveLength(1);

      testStore.resolveTopOfStack({ skip: true });
    });
  });
});
