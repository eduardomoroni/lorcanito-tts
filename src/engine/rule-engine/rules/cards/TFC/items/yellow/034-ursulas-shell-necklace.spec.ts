/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { ursulaShellNecklace } from "~/engine/cards/TFC/items";
import { grabYourSword, hakunaMatata } from "~/engine/cards/TFC/songs";

describe("Ursula's Shell Necklace", () => {
  describe('"NOW, SING! - Whenever you play a song, you may pay 1 **⬡** to draw a card.', () => {
    it("Drawing cards", () => {
      const testStore = new TestStore({
        deck: 2,
        inkwell: hakunaMatata.cost + grabYourSword.cost,
        hand: [hakunaMatata, grabYourSword],
        play: [ursulaShellNecklace],
      });

      const aTarget = testStore.getByZoneAndId("hand", hakunaMatata.id);
      const anotherTarget = testStore.getByZoneAndId("hand", grabYourSword.id);

      aTarget.playFromHand();
      testStore.resolveTopOfStack({ player: "player_one" });

      expect(testStore.getZonesCardCount().deck).toBe(1);
      expect(testStore.getZonesCardCount().hand).toBe(2);

      anotherTarget.playFromHand();
      testStore.resolveTopOfStack({ player: "player_one" });

      expect(testStore.getZonesCardCount().deck).toBe(0);
      expect(testStore.getZonesCardCount().hand).toBe(2);
    });

    it("Skipping effects", () => {
      const testStore = new TestStore({
        deck: 2,
        inkwell: hakunaMatata.cost + grabYourSword.cost,
        hand: [hakunaMatata, grabYourSword],
        play: [ursulaShellNecklace],
      });

      const aTarget = testStore.getByZoneAndId("hand", hakunaMatata.id);
      const anotherTarget = testStore.getByZoneAndId("hand", grabYourSword.id);

      aTarget.playFromHand();
      testStore.resolveTopOfStack();

      expect(testStore.getZonesCardCount().deck).toBe(1);
      expect(testStore.getZonesCardCount().hand).toBe(2);

      anotherTarget.playFromHand();
      testStore.resolveTopOfStack();

      expect(testStore.getZonesCardCount().deck).toBe(0);
      expect(testStore.getZonesCardCount().hand).toBe(2);
    });
  });
});
