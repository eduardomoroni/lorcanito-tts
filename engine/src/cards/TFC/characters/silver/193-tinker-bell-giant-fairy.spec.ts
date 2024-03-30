/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  heiheiBoatSnack,
  teKaHeartless,
  tinkerBellGiantFairy,
  tinkerBellTinyTactician,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Tinker Bell - Giant Fairy", () => {
  describe("**PUNY PIRATE!** During your turn, whenever this character banishes another character in a challenge, you may deal 2 damage to chosen opposing character.", () => {
    it("should deal two damage", () => {
      const testStore = new TestStore(
        {
          play: [tinkerBellGiantFairy],
        },
        {
          play: [heiheiBoatSnack, teKaHeartless],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        tinkerBellGiantFairy.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );
      const target = testStore.getByZoneAndId(
        "play",
        teKaHeartless.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);
      testStore.resolveTopOfStack({ targetId: target.instanceId });

      expect(defender.isDead).toBeTruthy();
      expect(target.meta.damage).toEqual(2);
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    });

    it("skips effect", () => {
      const testStore = new TestStore(
        {
          play: [tinkerBellGiantFairy],
        },
        {
          play: [heiheiBoatSnack, teKaHeartless],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        tinkerBellGiantFairy.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );
      const target = testStore.getByZoneAndId(
        "play",
        teKaHeartless.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);
      testStore.resolveTopOfStack({ skip: true });

      expect(target.meta.damage).toBeFalsy();
      expect(defender.isDead).toBeTruthy();
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    });
  });

  describe("**ROCK THE BOAT** When you play this character, deal 1 damage to each opposing character.", () => {
    it("Playing from hand", () => {
      const testStore = new TestStore(
        {
          inkwell: tinkerBellGiantFairy.cost,
          hand: [tinkerBellGiantFairy],
        },
        {
          play: [heiheiBoatSnack, teKaHeartless],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        tinkerBellGiantFairy.id,
      );
      const target = testStore.getByZoneAndId(
        "play",
        teKaHeartless.id,
        "player_two",
      );
      const anotherTarget = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      cardUnderTest.playFromHand();

      expect(target.meta.damage).toEqual(1);
      expect(anotherTarget.meta.damage).toEqual(1);
    });

    it("Shifting", () => {
      const testStore = new TestStore(
        {
          inkwell: tinkerBellGiantFairy.cost,
          hand: [tinkerBellGiantFairy],
          play: [tinkerBellTinyTactician],
        },
        {
          play: [heiheiBoatSnack, teKaHeartless],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        tinkerBellGiantFairy.id,
      );
      const shifted = testStore.getByZoneAndId(
        "play",
        tinkerBellTinyTactician.id,
      );

      const target = testStore.getByZoneAndId(
        "play",
        teKaHeartless.id,
        "player_two",
      );
      const anotherTarget = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      testStore.store.shiftCard(cardUnderTest.instanceId, shifted.instanceId);

      expect(target.meta.damage).toEqual(1);
      expect(anotherTarget.meta.damage).toEqual(1);
    });
  });
});
