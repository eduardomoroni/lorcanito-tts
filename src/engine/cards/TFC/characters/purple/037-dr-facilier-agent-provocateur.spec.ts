/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { fireTheCannons } from "~/engine/cards/TFC/actions/actions";
import {
  drFacilierAgentProvocateur,
  heiheiBoatSnack,
  mauiHeroToAll,
  mickeyMouseTrueFriend
} from "~/engine/cards/TFC/characters/characters";

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

      console.log(attacker.fullName, attacker.instanceId);
      console.log(defender.fullName, defender.instanceId);

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

  it.skip("Shift", () => {});
});
