/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  goofyKnightForADay,
  merlinRabbit,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Merlin - Rabbit", () => {
  describe("**HOPPITY HIP!** When you play this character and when he leaves play, you may draw a card.", () => {
    it("When you play", () => {
      const testStore = new TestStore({
        inkwell: merlinRabbit.cost,
        hand: [merlinRabbit],
        deck: 1,
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", merlinRabbit.id);

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          deck: 1,
          hand: 1,
          play: 0,
        }),
      );

      cardUnderTest.playFromHand();
      testStore.resolveOptionalAbility(true);

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          deck: 0,
          hand: 1,
          play: 1,
        }),
      );
    });

    it("When he leaves play", () => {
      const testStore = new TestStore(
        {
          play: [merlinRabbit],
          deck: 1,
        },
        { play: [goofyKnightForADay] },
      );

      const defender = testStore.getByZoneAndId(
        "play",
        goofyKnightForADay.id,
        "player_two",
      );
      const attacker = testStore.getByZoneAndId("play", merlinRabbit.id);

      defender.updateCardMeta({ exerted: true });

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          deck: 1,
          hand: 0,
          play: 1,
          discard: 0,
        }),
      );

      attacker.challenge(defender);
      testStore.resolveOptionalAbility(true);

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          deck: 0,
          hand: 1,
          play: 0,
          discard: 1,
        }),
      );
    });
  });
});
