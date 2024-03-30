/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { zeroToHero } from "@lorcanito/engine/cards/ROF/actions/actions";
import {
  fangCrossbow,
  pawpsicle,
} from "@lorcanito/engine/cards/ROF/items/items";
import {
  arthurTrainedSwordsman,
  cheshireCatAlwaysGrinning,
  feliciaAlwaysHungry,
  flynnRiderConfidentVagabond,
  littleJohnLoyalFriend,
  rabbitReluctantHost,
  ratiganCriminalMastermind,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Zero To Hero", () => {
  describe("Count the number of characters you have in play. You pay that amount of ⬡ less for the next character you play this turn.", () => {
    it("One character in play", () => {
      const testStore = new TestStore({
        inkwell: zeroToHero.cost,
        hand: [zeroToHero, feliciaAlwaysHungry],
        play: [pawpsicle, arthurTrainedSwordsman],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", zeroToHero.id);
      const target = testStore.getByZoneAndId("hand", feliciaAlwaysHungry.id);

      cardUnderTest.playFromHand();
      target.playFromHand();

      expect(target.zone).toEqual("play");
    });

    it("Five character in play", () => {
      const testStore = new TestStore({
        inkwell: zeroToHero.cost,
        hand: [zeroToHero, rabbitReluctantHost],
        play: [
          pawpsicle,
          fangCrossbow,
          arthurTrainedSwordsman,
          cheshireCatAlwaysGrinning,
          flynnRiderConfidentVagabond,
          littleJohnLoyalFriend,
          ratiganCriminalMastermind,
        ],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", zeroToHero.id);
      const target = testStore.getByZoneAndId("hand", rabbitReluctantHost.id);

      cardUnderTest.playFromHand();
      target.playFromHand();

      expect(target.zone).toEqual("play");
    });
  });
});
