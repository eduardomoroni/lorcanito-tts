/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { ursulaShellNecklace } from "~/engine/cards/TFC/items";
import { mickeyMouseTrueFriend } from "~/engine/cards/TFC";
import { controlYourTemper, healingGlow } from "~/engine/cards/TFC/actions";

describe("Static Continuous effects", () => {
  describe("Quest trigger", () => {
    it.failing(
      "should not trigger on quest when another character quests",
      () => {
        expect(false).toBeTruthy();
      }
    );
  });
  describe("Play trigger", () => {
    it("should not trigger for opponents card if the player target is self", () => {});
    it("On play with invalid target (playing a character and the effect triggers for item)", () => {
      const testStore = new TestStore({
        deck: 2,
        inkwell: controlYourTemper.cost + healingGlow.cost,
        hand: [controlYourTemper, healingGlow],
        play: [ursulaShellNecklace, mickeyMouseTrueFriend],
      });

      const aTarget = testStore.getByZoneAndId("hand", controlYourTemper.id);
      const anotherTarget = testStore.getByZoneAndId("hand", healingGlow.id);
      const mickey = testStore.getByZoneAndId("play", mickeyMouseTrueFriend.id);

      aTarget.playFromHand();
      testStore.resolveTopOfStack({ targetId: mickey.instanceId });
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);

      expect(testStore.getZonesCardCount().deck).toBe(2);
      expect(testStore.getZonesCardCount().hand).toBe(1);

      anotherTarget.playFromHand();

      testStore.resolveTopOfStack({ targetId: mickey.instanceId });
      expect(testStore.store.stackLayerStore.layers).toHaveLength(0);

      expect(testStore.getZonesCardCount().deck).toBe(2);
      expect(testStore.getZonesCardCount().hand).toBe(0);
    });
  });

  it.skip("on banished triggers by cards that have banished effects", () => {
    expect(false).toBeTruthy();
  });

  it.skip("on banished triggers by cards that damage", () => {
    expect(false).toBeTruthy();
  });

  it.skip("on banished triggers by challenge", () => {
    expect(false).toBeTruthy();
  });
});
