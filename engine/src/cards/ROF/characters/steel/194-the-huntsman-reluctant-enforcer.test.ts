/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  cobraBubblesSimpleEducator,
  theHuntsmanReluctantEnforcer,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("The Huntsman- Reluctant Enforcer", () => {
  it("**CHANGE OF HEART** Whenever this character quests, you may draw a card, then choose and discard a card.", () => {
    const testStore = new TestStore({
      deck: [cobraBubblesSimpleEducator],
      play: [theHuntsmanReluctantEnforcer],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      theHuntsmanReluctantEnforcer.id,
    );

    cardUnderTest.quest();

    testStore.resolveOptionalAbility();

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 0, play: 1, discard: 0 }),
    );

    const aCardToDiscard = testStore.getByZoneAndId(
      "hand",
      cobraBubblesSimpleEducator.id,
    );
    testStore.resolveTopOfStack({
      targets: [aCardToDiscard],
    });
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 0, deck: 0, play: 1, discard: 1 }),
    );
  });
});
