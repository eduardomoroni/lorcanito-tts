/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { ursulaCaldron } from "~/engine/cards/TFC/items/items";
import {chiefTui, heiheiBoatSnack, liloMakingAWish, moanaOfMotunui} from "~/engine/cards/TFC/characters/characters";

describe("Ursula's Cauldron", () => {
  describe("Peer Into The Depths", () => {
    it("Look at the top 2 cards of your deck. Put one on the top of your deck and the other on the bottom.", () => {
      const testStore = new TestStore({
        deck: [liloMakingAWish, moanaOfMotunui, chiefTui, heiheiBoatSnack],
        play: [ursulaCaldron],
        inkwell: ursulaCaldron.cost,
      });

      const cardUnderTest = testStore.getByZoneAndId("play", ursulaCaldron.id);
      const heihei = testStore.getByZoneAndId("deck", heiheiBoatSnack.id);
      const tui = testStore.getByZoneAndId("deck", chiefTui.id);

      cardUnderTest.activate();

      testStore.resolveTopOfStack({ scry: { top: [tui], bottom: [heihei] } });

      expect(
        testStore.store.tableStore
          .getPlayerZoneCards("player_one", "deck")
          .map((card) => card.lorcanitoCard?.name),
      ).toEqual([
        heiheiBoatSnack.name,
        liloMakingAWish.name,
        moanaOfMotunui.name,
        chiefTui.name,
      ]);
    });
  });
});
