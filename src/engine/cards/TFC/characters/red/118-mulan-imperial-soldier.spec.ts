/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {
    heiheiBoatSnack,
    mauiHeroToAll, moanaOfMotunui,
    mulanImperialSoldier,
    teKaHeartless,
    tinkerBellGiantFairy
} from "~/engine/cards/TFC/characters/characters";

describe("Mulan - Imperial Soldier", () => {
  describe("**Lead by example** During your turn, whenever this character banishes another character in a challenge, your other characters get +1 ◆ this turn.", () => {
    it("should deal two damage", () => {
      const otherCharacters = [moanaOfMotunui, mauiHeroToAll];
      const testStore = new TestStore(
        {
          play: [mulanImperialSoldier, ...otherCharacters],
        },
        {
          play: [heiheiBoatSnack, teKaHeartless],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        mulanImperialSoldier.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);

      otherCharacters.forEach((character) => {
        const card = testStore.getByZoneAndId(
          "play",
          character.id,
          "player_one",
        );

        expect(card.lore).toEqual((card.lorcanitoCard?.lore || 0) + 1);
      });
    });

    it("opponent's don't get the bonus", () => {
      const otherCharacters = [moanaOfMotunui, mauiHeroToAll];
      const testStore = new TestStore(
        {
          play: [mulanImperialSoldier, ...otherCharacters],
        },
        {
          play: [heiheiBoatSnack, teKaHeartless],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        mulanImperialSoldier.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);

      const card = testStore.getByZoneAndId(
        "play",
        teKaHeartless.id,
        "player_two",
      );

      expect(card.lore).not.toEqual((card.lorcanitoCard?.lore || 0) + 1);
    });

    it("Mulan itself doesn't get the bonus", () => {
      const testStore = new TestStore(
        {
          play: [mulanImperialSoldier],
        },
        {
          play: [heiheiBoatSnack, teKaHeartless],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        mulanImperialSoldier.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);

      expect(attacker.lore).not.toEqual(
        (attacker.lorcanitoCard?.lore || 0) + 1,
      );
    });
  });
});
