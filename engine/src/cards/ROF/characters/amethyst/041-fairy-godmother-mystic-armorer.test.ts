/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  fairyGodmotherMysticArmorer,
  pinocchioOnTheRun,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { liloMakingAWish } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Fairy Godmother - Mystic Armorer", () => {
  it("shift", () => {
    const testStore = new TestStore({
      play: [fairyGodmotherMysticArmorer],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      fairyGodmotherMysticArmorer.id,
    );

    expect(cardUnderTest.hasShift).toEqual(true);
  });

  describe("**FORGET THE COACH, HERE'S A SWORD** Whenever this character quests, your characters gain **Challenger** +3 and “When this character is banished in a challenge, return this card to your hand” this turn.", () => {
    it("Your characters gain Challenger +3", () => {
      const testStore = new TestStore(
        {
          play: [
            fairyGodmotherMysticArmorer,
            liloMakingAWish,
            pinocchioOnTheRun,
          ],
        },
        {
          deck: 1,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        fairyGodmotherMysticArmorer.id,
      );
      const target = testStore.getByZoneAndId("play", liloMakingAWish.id);
      const target2 = testStore.getByZoneAndId("play", pinocchioOnTheRun.id);

      [target, target2].forEach((target) => {
        expect(target.hasChallenger).toEqual(false);
      });
      cardUnderTest.quest();
      [target, target2].forEach((target) => {
        expect(target.hasChallenger).toEqual(true);
      });
      testStore.passTurn();
      [target, target2].forEach((target) => {
        expect(target.hasChallenger).toEqual(false);
      });
    });

    it("your characters gain “When this character is banished in a challenge, return this card to your hand”", () => {
      const testStore = new TestStore(
        {
          play: [fairyGodmotherMysticArmorer, liloMakingAWish],
        },
        {
          play: [pinocchioOnTheRun],
        },
      );
      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        fairyGodmotherMysticArmorer.id,
      );
      const attacker = testStore.getByZoneAndId("play", liloMakingAWish.id);
      const defender = testStore.getByZoneAndId(
        "play",
        pinocchioOnTheRun.id,
        "player_two",
      );

      cardUnderTest.quest();

      defender.updateCardMeta({ exerted: true });
      attacker.challenge(defender);

      expect(attacker.zone).toEqual("hand");
    });
  });
});
