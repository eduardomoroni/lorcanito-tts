/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  dragonFire,
  fireTheCannons,
} from "@lorcanito/engine/cards/TFC/actions/actions";
import {
  drFacilierAgentProvocateur,
  heiheiBoatSnack,
  mauiHeroToAll,
  mickeyMouseTrueFriend,
  moanaOfMotunui,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Dr. Facilier - Agent Provocateur", () => {
  it.skip("has shift ability", () => {});

  describe("Into the Shadows: Whenever one of your other characters is banished in a challenge, you may return that card to your hand.", () => {
    it("returns attacker character to hand", () => {
      const testStore = new TestStore(
        {
          play: [heiheiBoatSnack, drFacilierAgentProvocateur],
        },
        {
          play: [mickeyMouseTrueFriend],
        },
      );

      const attacker = testStore.getByZoneAndId("play", heiheiBoatSnack.id);
      const defender = testStore.getByZoneAndId(
        "play",
        mickeyMouseTrueFriend.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);
      testStore.resolveTopOfStack();

      expect(testStore.getZonesCardCount("player_one")).toEqual(
        expect.objectContaining({ hand: 1, play: 1 }),
      );
    });

    it("returns defender character to hand", () => {
      const testStore = new TestStore(
        {
          play: [mickeyMouseTrueFriend],
        },
        {
          play: [heiheiBoatSnack, drFacilierAgentProvocateur],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        mickeyMouseTrueFriend.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);
      testStore.resolveTopOfStack();

      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({ hand: 1, play: 1 }),
      );
    });

    it("lets player skip the effect", () => {
      const testStore = new TestStore(
        {
          play: [mickeyMouseTrueFriend],
        },
        {
          play: [heiheiBoatSnack, drFacilierAgentProvocateur],
        },
      );

      const attacker = testStore.getByZoneAndId(
        "play",
        mickeyMouseTrueFriend.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);
      testStore.resolveTopOfStack({ skip: true });

      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({ discard: 1, play: 1 }),
      );
    });

    it("doesn't return itself to hand", () => {
      const testStore = new TestStore(
        {
          play: [mauiHeroToAll],
        },
        {
          play: [heiheiBoatSnack, drFacilierAgentProvocateur],
        },
      );

      const attacker = testStore.getByZoneAndId("play", mauiHeroToAll.id);
      const defender = testStore.getByZoneAndId(
        "play",
        drFacilierAgentProvocateur.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attacker.challenge(defender);
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);

      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({ discard: 1, play: 1 }),
      );
    });

    it("doesn't return card to hand if it's banished outside a challenge", () => {
      const testStore = new TestStore(
        {
          inkwell: fireTheCannons.cost,
          hand: [fireTheCannons],
        },
        {
          play: [heiheiBoatSnack, drFacilierAgentProvocateur],
        },
      );

      const action = testStore.getByZoneAndId("hand", fireTheCannons.id);
      const target = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      action.playFromHand();
      testStore.resolveTopOfStack({ targetId: target.instanceId });

      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({ discard: 1, play: 1 }),
      );
    });

    it("Doesn't return self when banished outside of a challenge", () => {
      const testStore = new TestStore(
        {
          hand: [dragonFire],
          inkwell: dragonFire.cost,
        },
        {
          play: [drFacilierAgentProvocateur],
        },
      );

      const removal = testStore.getByZoneAndId("hand", dragonFire.id);
      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        drFacilierAgentProvocateur.id,
        "player_two",
      );

      removal.playFromHand();

      testStore.resolveTopOfStack({
        targetId: cardUnderTest.instanceId,
      });

      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
      expect(cardUnderTest.zone).toEqual("discard");
    });

    describe("Opponent's chars should not be affected by Into the Shadows", () => {
      it("doesn't return attacker character to hand", () => {
        const testStore = new TestStore(
          {
            play: [mickeyMouseTrueFriend, drFacilierAgentProvocateur],
          },
          {
            play: [heiheiBoatSnack],
          },
        );

        const attacker = testStore.getByZoneAndId(
          "play",
          mickeyMouseTrueFriend.id,
        );
        const defender = testStore.getByZoneAndId(
          "play",
          heiheiBoatSnack.id,
          "player_two",
        );

        defender.updateCardMeta({ exerted: true });

        attacker.challenge(defender);

        expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
        expect(defender.isDead).toEqual(true);
      });

      it("doesn't return defender character to hand", () => {
        const testStore = new TestStore(
          {
            play: [mickeyMouseTrueFriend, drFacilierAgentProvocateur],
          },
          {
            play: [heiheiBoatSnack],
          },
        );

        const attacker = testStore.getByZoneAndId(
          "play",
          mickeyMouseTrueFriend.id,
        );
        const defender = testStore.getByZoneAndId(
          "play",
          heiheiBoatSnack.id,
          "player_two",
        );

        defender.updateCardMeta({ exerted: true });

        attacker.challenge(defender);

        expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
        expect(defender.isDead).toEqual(true);
      });
    });
  });

  describe("Regression", () => {
    it("When Dr. Facilier is banished, his effect should not trigger.", () => {
      const testStore = new TestStore(
        {
          play: [mickeyMouseTrueFriend, mauiHeroToAll],
          hand: [dragonFire],
          inkwell: dragonFire.cost,
        },
        {
          play: [
            heiheiBoatSnack,
            drFacilierAgentProvocateur,
            drFacilierAgentProvocateur,
          ],
        },
      );

      // Removing the first Dr. Facilier from play, using an action.
      const removal = testStore.getByZoneAndId("hand", dragonFire.id);
      const firstFacilier = testStore.getByZoneAndId(
        "play",
        drFacilierAgentProvocateur.id,
        "player_two",
      );

      removal.playFromHand();
      testStore.resolveTopOfStack({
        targetId: firstFacilier.instanceId,
      });

      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
      expect(firstFacilier.zone).toEqual("discard");

      // Removing second Facilier from play, using a challenge.
      const attacker = testStore.getByZoneAndId("play", mauiHeroToAll.id);
      const secondFacilier = testStore.getByZoneAndId(
        "play",
        drFacilierAgentProvocateur.id,
        "player_two",
      );

      secondFacilier.updateCardMeta({ exerted: true });
      attacker.challenge(secondFacilier);

      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
      expect(secondFacilier.zone).toEqual("discard");

      // And lastly, challenging another char to make sure the effect doesn't trigger.
      const attackerTwo = testStore.getByZoneAndId(
        "play",
        mickeyMouseTrueFriend.id,
      );
      const defender = testStore.getByZoneAndId(
        "play",
        heiheiBoatSnack.id,
        "player_two",
      );

      defender.updateCardMeta({ exerted: true });

      attackerTwo.challenge(defender);

      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
      expect(defender.isDead).toEqual(true);

      expect(testStore.getZonesCardCount("player_two")).toEqual(
        expect.objectContaining({ discard: 3 }),
      );
    });
  });
});
