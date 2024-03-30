/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  herculesHeroInTraining,
  kronkJuniorChipmunk,
  pachaVillageLeader,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Kronk- Junior Chipmunk", () => {
  it("Resist 1", () => {
    const testStore = new TestStore({
      play: [kronkJuniorChipmunk],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      kronkJuniorChipmunk.id,
    );

    expect(cardUnderTest.hasResist).toBeTruthy();
    expect(cardUnderTest.damageReduction).toEqual(1);
  });

  describe("**SCOUT LEADER** During your turn, whenever this character banishes another character in a challenge, you may deal 2 damage to chosen character.", () => {
    describe("During your turn", () => {
      it("Banish another character in a challenge", () => {
        const testStore = new TestStore(
          {
            play: [kronkJuniorChipmunk],
          },
          { play: [herculesHeroInTraining, pachaVillageLeader] },
        );

        const attacker = testStore.getByZoneAndId(
          "play",
          kronkJuniorChipmunk.id,
        );
        const defender = testStore.getByZoneAndId(
          "play",
          herculesHeroInTraining.id,
          "player_two",
        );
        const target = testStore.getByZoneAndId(
          "play",
          pachaVillageLeader.id,
          "player_two",
        );

        defender.updateCardMeta({ exerted: true });

        attacker.challenge(defender);
        testStore.resolveTopOfStack({ targetId: target.instanceId });

        expect(defender.isDead).toBeTruthy();
        expect(target.meta.damage).toEqual(2);
        expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
      });
    });
  });
});
