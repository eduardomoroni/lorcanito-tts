/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { letTheStormRageOn } from "@lorcanito/engine/cards/ROF/actions/actions";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Let the Storm Rage On", () => {
  it("Deal 2 damage to chosen character. Draw a card.", () => {
    const testStore = new TestStore(
      {
        inkwell: letTheStormRageOn.cost,
        hand: [letTheStormRageOn],
        deck: 2,
      },
      { play: [goofyKnightForADay] },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      letTheStormRageOn.id,
    );
    const target = testStore.getByZoneAndId(
      "play",
      goofyKnightForADay.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.meta.damage).toEqual(2);
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        deck: 1,
        hand: 1,
      }),
    );
  });
});
