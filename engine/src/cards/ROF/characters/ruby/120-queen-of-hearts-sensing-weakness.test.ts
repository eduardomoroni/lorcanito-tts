/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  caterpillarCalmAndCollected,
  hiramFlavershamToymaker,
  jasmineHeirOfAgrabah,
  queenOfHeartsSensingWeakness,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Queen of Hearts - Sensing Weakness", () => {
  it("Shift", () => {
    const testStore = new TestStore({
      play: [queenOfHeartsSensingWeakness],
      deck: 5,
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      queenOfHeartsSensingWeakness.id,
    );

    expect(cardUnderTest.hasShift).toEqual(true);
  });

  it("**LET THE GAME BEGIN** Whenever one of your characters challenges another character, you may draw a card.", () => {
    const testStore = new TestStore(
      {
        deck: 5,
        play: [
          queenOfHeartsSensingWeakness,
          caterpillarCalmAndCollected,
          jasmineHeirOfAgrabah,
        ],
      },
      {
        play: [hiramFlavershamToymaker],
      },
    );

    const defender = testStore.getByZoneAndId(
      "play",
      hiramFlavershamToymaker.id,
      "player_two",
    );
    defender.updateCardMeta({ exerted: true });

    const attackerOne = testStore.getByZoneAndId(
      "play",
      caterpillarCalmAndCollected.id,
    );
    const attackerTwo = testStore.getByZoneAndId(
      "play",
      jasmineHeirOfAgrabah.id,
    );

    attackerOne.challenge(defender);
    testStore.resolveOptionalAbility();
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 1, deck: 4 }),
    );

    attackerTwo.challenge(defender);
    testStore.resolveOptionalAbility();
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ hand: 2, deck: 3 }),
    );
  });
});
