/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { legendOfTheSwordInTheStone } from "@lorcanito/engine/cards/ROF/actions/actions";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Legend of the Sword in the Stone", () => {
  it("Chosen character gains **Challenger** +3 this turn.", () => {
    const testStore = new TestStore(
      {
        inkwell: legendOfTheSwordInTheStone.cost,
        hand: [legendOfTheSwordInTheStone],
        play: [goofyKnightForADay],
      },
      {
        deck: 1,
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      legendOfTheSwordInTheStone.id,
    );
    const target = testStore.getByZoneAndId("play", goofyKnightForADay.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });
    expect(target.hasChallenger).toBe(true);

    testStore.passTurn();

    expect(target.hasChallenger).toBe(false);
  });
});
