/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { sleepysFlute } from "@lorcanito/engine/cards/ROF/items/items";
import { hakunaMatata } from "@lorcanito/engine/cards/TFC/songs/songs";

describe("Sleepy's Flute", () => {
  describe("**A SILLY SONG** ↷ − If you played a song this turn, gain 1 lore.", () => {
    it("should gain 1 lore if a song was played this turn", () => {
      const testStore = new TestStore({
        inkwell: hakunaMatata.cost,
        hand: [hakunaMatata],
        play: [sleepysFlute],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", sleepysFlute.id);
      const song = testStore.getByZoneAndId("hand", hakunaMatata.id);

      song.playFromHand();
      cardUnderTest.activate();

      expect(cardUnderTest.ready).toEqual(false);
      expect(testStore.store.tableStore.getTable().lore).toEqual(1);
    });

    it("should not gain 1 lore if a song was NOT played this turn", () => {
      const testStore = new TestStore({
        play: [sleepysFlute],
      });

      const cardUnderTest = testStore.getByZoneAndId("play", sleepysFlute.id);

      cardUnderTest.activate();

      expect(testStore.store.tableStore.getTable().lore).toEqual(0);
    });
  });
});
