/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { donaldDuckPerfectGentleman } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Donald Duck - Perfect Gentleman", () => {
  it("Shifts", () => {
    const testStore = new TestStore({
      play: [donaldDuckPerfectGentleman],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      donaldDuckPerfectGentleman.id,
    );

    expect(cardUnderTest.hasShift).toEqual(true);
  });

  it("**ALLOW ME** At the start of your turn, each player may draw a card.", () => {
    const testStore = new TestStore(
      { deck: 3 },
      {
        play: [donaldDuckPerfectGentleman],
        deck: 3,
      },
    );

    testStore.passTurn();

    // Card owner's effect
    testStore.resolveOptionalAbility();
    expect(testStore.getZonesCardCount("player_two")).toEqual(
      expect.objectContaining({
        deck: 1,
        hand: 2,
      }),
    );

    // Card owner's opponent's effect
    // TODO: Fix this
    //   testStore.resolveOptionalAbility();
    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({
        deck: 2,
        hand: 1,
      }),
    );

    testStore.passTurn();
    expect(testStore.stackLayers).toHaveLength(0);

    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({
        deck: 1,
        hand: 2,
      }),
    );
  });
});
