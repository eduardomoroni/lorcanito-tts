/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  annaHeirToArendelle,
  elsaQueenRegent,
  timonGrubRustler,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("CardStore", () => {
  describe("Card Filter", () => {
    test("Complex Name Filter", () => {
      const testStore = new TestStore({
        hand: [annaHeirToArendelle],
        play: [elsaQueenRegent],
      });

      const cardUnderTest = testStore.getByZoneAndId(
        "hand",
        annaHeirToArendelle.id,
      );
      const result = testStore.store.cardStore.getCardsByFilter(
        [
          { filter: "zone", value: "play" },
          { filter: "type", value: "character" },
          { filter: "owner", value: "self" },
          {
            filter: "attribute",
            value: "name",
            comparison: { operator: "eq", value: "Elsa" },
          },
        ],
        "player_one",
        cardUnderTest,
      );

      expect(result).toHaveLength(1);
    });
  });
});
