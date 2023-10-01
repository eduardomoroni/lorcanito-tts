/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {
  mauriceWorldFamousInventor,
  mickeyMouseDetective,
} from "~/engine/cards/TFC/characters/characters";

describe("Mickey Mouse - Detective", () => {
  it("**GET A CLUE** When you play this character, you may put the top card of your deck into your inkwell facedown and exerted.", () => {
    const testStore = new TestStore({
      inkwell: mickeyMouseDetective.cost,
      deck: [mauriceWorldFamousInventor],
      hand: [mickeyMouseDetective],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      mickeyMouseDetective.id,
    );

    const topDeckCard = testStore.getByZoneAndId(
      "deck",
      mauriceWorldFamousInventor.id,
    );

    cardUnderTest.playFromHand();

    expect(topDeckCard.zone).toEqual("inkwell");
    expect(topDeckCard.ready).toEqual(false);
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
  });
});
