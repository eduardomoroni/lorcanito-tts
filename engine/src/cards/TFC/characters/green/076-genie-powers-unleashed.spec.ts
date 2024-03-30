/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { dragonFire } from "@lorcanito/engine/cards/TFC/actions/actions";

import {
  cinderellaGentleAndKind,
  geniePowerUnleashed,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Genie - Powers Unleashed", () => {
  describe("Phenomenal Cosmic Power - Whenever this character quests, you may play an action with cost 5 or less for free.", () => {
    it("On quest - play an action for free", () => {
      const testStore = new TestStore({
        deck: 2,
        play: [geniePowerUnleashed],
        hand: [dragonFire],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        geniePowerUnleashed.id,
      );
      const target = testStore.getByZoneAndId("hand", dragonFire.id);

      cardUnderTest.quest();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({ targetId: target.instanceId });

      expect(target.zone).toEqual("play");
    });

    it("On quest - if no valid target is available, skip it", () => {
      const testStore = new TestStore({
        deck: 2,
        play: [geniePowerUnleashed],
        hand: [cinderellaGentleAndKind],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        geniePowerUnleashed.id,
      );
      const shouldNotBeTarget = testStore.getByZoneAndId(
        "hand",
        cinderellaGentleAndKind.id,
      );

      cardUnderTest.quest();
      testStore.resolveTopOfStack();

      expect(shouldNotBeTarget.zone).toEqual("hand");
    });
  });
});
