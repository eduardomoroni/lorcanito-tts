/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  gantuGalacticFederationCaptain,
  horaceNoGood,
  jumbaJokibaaRenegadeScientist,
  tamatoaDrabLittleCrab,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Gantu - Galactic Federation Captain", () => {
  describe("**Under arrest** Characters with cost 2 or less can't challenge your characters.", () => {
    it("Characters with cost 2 or less can't challenge your other characters.", () => {
      const testStore = new TestStore(
        {
          play: [tamatoaDrabLittleCrab],
        },
        {
          play: [gantuGalacticFederationCaptain, jumbaJokibaaRenegadeScientist],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        tamatoaDrabLittleCrab.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        jumbaJokibaaRenegadeScientist.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);

      expect(defender.zone).toEqual("play");
      expect(defender.meta.damage).toBeFalsy();

      expect(attacker.zone).toEqual("play");
      expect(attacker.meta.damage).toBeFalsy();
      expect(attacker.lorcanitoCard.cost).toEqual(2);
    });

    it("Characters with cost 2 or less can't challenge THIS character.", () => {
      const testStore = new TestStore(
        {
          play: [tamatoaDrabLittleCrab],
        },
        {
          play: [gantuGalacticFederationCaptain],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        tamatoaDrabLittleCrab.id,
      );
      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        gantuGalacticFederationCaptain.id,
        "player_two",
      );

      cardUnderTest.updateCardMeta({ exerted: true });

      attacker.challenge(cardUnderTest);

      expect(cardUnderTest.zone).toEqual("play");
      expect(cardUnderTest.meta.damage).toBeFalsy();

      expect(attacker.zone).toEqual("play");
      expect(attacker.meta.damage).toBeFalsy();
      expect(attacker.lorcanitoCard.cost).toEqual(2);
    });

    it("Characters with cost 3 or more can challenge this character.", () => {
      const testStore = new TestStore(
        {
          play: [horaceNoGood],
        },
        {
          play: [gantuGalacticFederationCaptain],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        gantuGalacticFederationCaptain.id,
        "player_two",
      );
      const attacker = testStore.getByZoneAndId("play", horaceNoGood.id);

      cardUnderTest.updateCardMeta({ exerted: true });

      attacker.challenge(cardUnderTest);

      expect(cardUnderTest.zone).toEqual("play");
      expect(cardUnderTest.meta.damage).toBeTruthy();

      expect(attacker.zone).toEqual("discard");
      expect(attacker.lorcanitoCard.cost).toEqual(3);
    });
  });
});
