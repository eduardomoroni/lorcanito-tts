/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { strengthOfARagingFire } from "@lorcanito/engine/cards/ROF/actions/actions";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";
import {
  liloMakingAWish,
  stichtNewDog,
  tiggerWonderfulThing,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Strength of a Raging Fire", () => {
  it("Deal damage to chosen character equal to the number of characters you have in play.", () => {
    const testStore = new TestStore({
      inkwell: strengthOfARagingFire.cost,
      hand: [strengthOfARagingFire],
      play: [
        goofyKnightForADay,
        liloMakingAWish,
        stichtNewDog,
        tiggerWonderfulThing,
      ],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      strengthOfARagingFire.id,
    );
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.meta.damage).toEqual(4);
  });
});
