/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  fidgetRatigansHenchman,
  ladyTremaineImperiousQueen,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Lady Tremaine - Imperious Queen", () => {
  it("Shift", () => {
    const testStore = new TestStore({
      play: [ladyTremaineImperiousQueen],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      ladyTremaineImperiousQueen.id,
    );

    expect(cardUnderTest.hasShift).toBe(true);
  });

  it("**POWER TO RULE AT LAST** When you play this character, each opponent chooses and banishes one of their characters.", () => {
    const testStore = new TestStore(
      {
        inkwell: ladyTremaineImperiousQueen.cost,
        hand: [ladyTremaineImperiousQueen],
      },
      {
        play: [fidgetRatigansHenchman],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      ladyTremaineImperiousQueen.id,
    );
    const target = testStore.getByZoneAndId(
      "play",
      fidgetRatigansHenchman.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.zone).toBe("discard");
  });
});
