/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  rapunzelGiftedArtist,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Rapunzel - Gifted Artist", () => {
  it("**LET YOUR POWER SHINE** Whenever you remove 1 or more damage from one of your characters, you may draw a card.", () => {
    const testStore = new TestStore({
      play: [rapunzelGiftedArtist, goofyKnightForADay],
      deck: 5,
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      rapunzelGiftedArtist.id,
    );
    const anotherCharacter = testStore.getByZoneAndId(
      "play",
      goofyKnightForADay.id,
    );

    cardUnderTest.updateCardDamage(4);
    anotherCharacter.updateCardDamage(4);

    cardUnderTest.updateCardDamage(2, "remove");
    testStore.resolveOptionalAbility();
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        deck: 4,
        hand: 1,
      }),
    );

    anotherCharacter.updateCardDamage(2, "remove");
    testStore.resolveOptionalAbility();
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        deck: 3,
        hand: 2,
      }),
    );
  });

  it("Shift", () => {
    const testStore = new TestStore({
      play: [rapunzelGiftedArtist],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      rapunzelGiftedArtist.id,
    );

    expect(cardUnderTest.hasShift).toEqual(true);
  });
});
