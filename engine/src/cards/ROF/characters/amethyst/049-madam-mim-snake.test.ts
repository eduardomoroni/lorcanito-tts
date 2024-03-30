/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  madamMimSnake,
  pinocchioStarAttraction,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Madam Mim - Snake", () => {
  describe("**JUST YOU WAIT** When you play this character, banish her or return another chosen character of yours to your hand.", () => {
    it("skipping the effect banishes her", () => {
      const testStore = new TestStore({
        inkwell: madamMimSnake.cost,
        hand: [madamMimSnake],
        play: [pinocchioStarAttraction],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", madamMimSnake.id);
      const target = testStore.getByZoneAndId(
        "play",
        pinocchioStarAttraction.id,
      );

      cardUnderTest.playFromHand();
      testStore.resolveTopOfStack({ skip: true });

      expect(target.zone).toEqual("play");
      expect(cardUnderTest.zone).toEqual("discard");
      expect(testStore.stackLayers).toHaveLength(0);
    });

    it("return another chosen character of yours to your hand.", () => {
      const testStore = new TestStore({
        inkwell: madamMimSnake.cost,
        hand: [madamMimSnake],
        play: [pinocchioStarAttraction],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", madamMimSnake.id);
      const target = testStore.getByZoneAndId(
        "play",
        pinocchioStarAttraction.id,
      );

      cardUnderTest.playFromHand();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({ targets: [target] });

      expect(target.zone).toEqual("hand");
      expect(cardUnderTest.zone).toEqual("play");
      expect(testStore.stackLayers).toHaveLength(0);
    });
  });
});
