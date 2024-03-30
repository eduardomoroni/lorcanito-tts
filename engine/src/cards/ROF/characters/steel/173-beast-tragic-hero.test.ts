/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { beastTragicHero } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Beast- Tragic Hero", () => {
  describe("IT’S BETTER THIS WAY** At the start of your turn, if this character has no damage, draw a card. Otherwise, he gets +4 ※ this turn.", () => {
    it("No damage", () => {
      const testStore = new TestStore(
        {
          play: [beastTragicHero],
          deck: 3,
        },
        {
          deck: 2,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        beastTragicHero.id,
      );

      testStore.passTurn();
      testStore.passTurn();

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          deck: 1,
          hand: 2,
        }),
      );
      expect(cardUnderTest.strength).toEqual(beastTragicHero.strength);
    });

    it("With Damage", () => {
      const testStore = new TestStore(
        {
          play: [beastTragicHero],
          deck: 3,
        },
        {
          deck: 2,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        beastTragicHero.id,
      );
      cardUnderTest.updateCardDamage(1);

      testStore.passTurn();
      testStore.passTurn();

      expect(cardUnderTest.strength).toEqual(beastTragicHero.strength + 4);
      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          deck: 2,
          hand: 1,
        }),
      );
    });
  });
});
