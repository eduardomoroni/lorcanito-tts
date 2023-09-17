/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import {
  captainColonelsLieutenant,
  teKaTheBurningOne,
} from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { justInTime } from "~/engine/cards/TFC/actions";

describe("Just in Time", () => {
  describe("Costs <= 5", () => {
    it("Plays action card for free", () => {
      const testStore = new TestStore({
        inkwell: justInTime.cost,
        hand: [justInTime, captainColonelsLieutenant],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", justInTime.id);
      const target = testStore.getByZoneAndId(
        "hand",
        captainColonelsLieutenant.id
      );

      cardUnderTest.playFromHand();
      expect(cardUnderTest.zone).toEqual("discard");

      testStore.resolveTopOfStack({ targetId: target.instanceId });
      expect(target.zone).toEqual("play");
    });

    it.failing("Shifts character card for free", () => {
      throw new Error("Not implemented");
    });
  });

  describe("Costs > 5", () => {
    it("Doesn't play for free", () => {
      const testStore = new TestStore({
        inkwell: justInTime.cost,
        hand: [justInTime, teKaTheBurningOne],
      });

      const cardUnderTest = testStore.getByZoneAndId("hand", justInTime.id);
      const target = testStore.getByZoneAndId("hand", teKaTheBurningOne.id);

      cardUnderTest.playFromHand();
      expect(cardUnderTest.zone).toEqual("discard");

      testStore.resolveTopOfStack({ targetId: target.instanceId });
      expect(target.zone).toEqual("hand");

      // TODO: We still have to decide what to do with the stack, when there's no valid target.
      // Ideally we should not be able to play the card, but this would require to check valid targets before playing the card
      expect(testStore.store.stackLayerStore.layers).toHaveLength(1);
    });

    it.failing("Doesn't shift character card for free", () => {
      throw new Error("Not implemented");
    });
  });
});
