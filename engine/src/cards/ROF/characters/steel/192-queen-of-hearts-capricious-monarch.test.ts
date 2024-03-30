/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { queenOfHeartsCapriciousMonarch } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Queen of Hearts- Capricious Monarch", () => {
  it("**OFF WITH THEIR HEADS!** Whenever an opposing character is banished, you may ready this character.", () => {
    const testStore = new TestStore({
      hand: [queenOfHeartsCapriciousMonarch],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      queenOfHeartsCapriciousMonarch.id,
    );

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({});
  });
});
