/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {cruellaDeVilMiserableAsUsual, teKaTheBurningOne} from "~/engine/cards/TFC/characters/characters";

describe("Cruella De Vil - Miserable As Usual", () => {
  describe("**You'll Be Sorry** When this character is challenged and banished, you may return chosen character to their player's hand.", () => {
    it("should banish the challenging character", () => {
      const testStore = new TestStore(
        {
          play: [teKaTheBurningOne],
        },
        {
          play: [cruellaDeVilMiserableAsUsual],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        cruellaDeVilMiserableAsUsual.id,
        "player_two",
      );

      const attacker = testStore.getByZoneAndId("play", teKaTheBurningOne.id);

      expect(cardUnderTest.zone).toEqual("play");
      cardUnderTest.updateCardMeta({ exerted: true });

      attacker.challenge(cardUnderTest);

      testStore.resolveTopOfStack({ targetId: attacker.instanceId });

      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({ discard: 1, play: 0 }),
      );
      expect(testStore.getZonesCardCount("player_one")).toEqual(
        expect.objectContaining({ hand: 1, play: 0 }),
      );
      expect(attacker.zone).toEqual("hand");
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    });

    it("skips banish effect", () => {
      const testStore = new TestStore(
        {
          play: [teKaTheBurningOne],
        },
        {
          play: [cruellaDeVilMiserableAsUsual],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        cruellaDeVilMiserableAsUsual.id,
        "player_two",
      );

      const attacker = testStore.getByZoneAndId("play", teKaTheBurningOne.id);

      expect(cardUnderTest.zone).toEqual("play");
      cardUnderTest.updateCardMeta({ exerted: true });

      attacker.challenge(cardUnderTest);
      testStore.resolveTopOfStack({ skip: true });

      expect(testStore.getZonesCardCount("player_one")).toEqual(
        expect.objectContaining({ discard: 0, play: 1 }),
      );
      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({ discard: 1, play: 0 }),
      );
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    });
  });
});
