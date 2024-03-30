/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { iveGotADream } from "@lorcanito/engine/cards/ITI/actions/actions";

describe("I've Got a Dream", () => {
  it.skip("_(A character with cost 2 or more can ↷ to sing this song for free.)_Ready chosen character of yours at a location. They can't quest for the rest of this turn. Gain lore equal to that location ◆.", () => {
    const testStore = new TestStore({
      inkwell: iveGotADream.cost,
      hand: [iveGotADream],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", iveGotADream.id);

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
