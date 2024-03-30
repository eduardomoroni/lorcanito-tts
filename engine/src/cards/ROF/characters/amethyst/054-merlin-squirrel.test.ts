/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  merlinSquirrel,
  chipTheTeacupGentleSoul,
  princeNaveenPennilessRoyal,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { smash } from "@lorcanito/engine/cards/TFC/actions/actions";

describe("Merlin - Squirrel", () => {
  describe("**LOOK BEFORE YOU LEAP** When you play this character and when he leaves play, look at the top card of your deck. Put it on either the top or the bottom of your deck.", () => {
    it("When you play", () => {
      const testStore = new TestStore({
        deck: [chipTheTeacupGentleSoul, princeNaveenPennilessRoyal],
        inkwell: merlinSquirrel.cost,
        hand: [merlinSquirrel],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", merlinSquirrel.id);
      const first = testStore.getByZoneAndId(
        "deck",
        princeNaveenPennilessRoyal.id,
      );
      const last = testStore.getByZoneAndId("deck", chipTheTeacupGentleSoul.id);

      expect(testStore.store.tableStore.getTable().zones.deck.cards).toEqual([
        last,
        first,
      ]);

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ scry: { top: [last] } });

      expect(testStore.store.tableStore.getTable().zones.deck.cards).toEqual([
        first,
        last,
      ]);
    });

    it("When he leaves play", () => {
      const testStore = new TestStore({
        deck: [chipTheTeacupGentleSoul, princeNaveenPennilessRoyal],
        inkwell: smash.cost,
        hand: [smash],
        play: [merlinSquirrel],
      });

      const removal = testStore.getByZoneAndId("hand", smash.id);
      const target = testStore.getByZoneAndId("play", merlinSquirrel.id);

      const first = testStore.getByZoneAndId(
        "deck",
        princeNaveenPennilessRoyal.id,
      );
      const last = testStore.getByZoneAndId("deck", chipTheTeacupGentleSoul.id);

      expect(testStore.store.tableStore.getTable().zones.deck.cards).toEqual([
        last,
        first,
      ]);

      removal.playFromHand();
      testStore.resolveTopOfStack(
        {
          targets: [target],
        },
        true,
      );

      testStore.resolveTopOfStack({ scry: { bottom: [first] } });

      expect(testStore.store.tableStore.getTable().zones.deck.cards).toEqual([
        first,
        last,
      ]);
    });
  });
});
