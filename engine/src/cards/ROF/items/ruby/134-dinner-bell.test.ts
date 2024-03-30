/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { dinnerBell } from "@lorcanito/engine/cards/ROF/items/items";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";
import {
  goodyDaredevil,
  goofyMusketeer,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Dinner Bell", () => {
  it("**YOU KNOW WHAT HAPPENS** ↷, 2 ⬡ − Draw cards equal to the damage on chosen character of yours, then banish them.", () => {
    const testStore = new TestStore({
      inkwell: 2,
      deck: 4,
      play: [dinnerBell, goofyKnightForADay, goofyMusketeer, goodyDaredevil],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", dinnerBell.id);
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);
    const target2 = testStore.getByZoneAndId("play", goofyMusketeer.id);
    const target3 = testStore.getByZoneAndId("play", goodyDaredevil.id);

    // First target won't have any damage
    [target, target2, target3].forEach((target, index) => {
      target.updateCardDamage(index);
    });

    cardUnderTest.activate();

    expect(cardUnderTest.ready).toEqual(false);
    expect(target.zone).toEqual("play");
    expect(target2.zone).toEqual("discard");
    expect(target3.zone).toEqual("discard");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        hand: 2,
        discard: 2,
        deck: 2,
      }),
    );
  });
});
