/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  caterpillarCalmAndCollected,
  hiramFlavershamToymaker,
  jasmineHeirOfAgrabah,
  shereKhanMenacingPredator,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Shere Khan - Menacing Predator", () => {
  it("**DON'T INSULT MY INTELLIGENCE** Whenever one of your characters challenges another character, gain 1 lore.", () => {
    const testStore = new TestStore(
      {
        play: [
          shereKhanMenacingPredator,
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

    expect(testStore.getPlayerLore()).toEqual(0);

    attackerOne.challenge(defender);
    testStore.resolveOptionalAbility();
    expect(testStore.getPlayerLore()).toEqual(1);

    attackerTwo.challenge(defender);
    testStore.resolveOptionalAbility();
    expect(testStore.getPlayerLore()).toEqual(2);
  });
});
