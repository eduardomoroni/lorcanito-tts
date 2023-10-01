/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import {
  mauriceWorldFamousInventor,
  grammaTalaStoryteller,
} from "~/engine/cards/TFC/characters/characters";

describe("Gramma Tala - Storyteller", () => {
  it("**I WILL BE WITH YOU** When this character is banished, you may put this card into your inkwell facedown and exerted.", () => {
    const testStore = new TestStore(
      {
        inkwell: grammaTalaStoryteller.cost,
        play: [grammaTalaStoryteller],
      },
      {
        play: [mauriceWorldFamousInventor],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      grammaTalaStoryteller.id,
    );

    cardUnderTest.updateCardMeta({ exerted: true });
    const attacker = testStore.getByZoneAndId(
      "play",
      mauriceWorldFamousInventor.id,
      "player_two",
    );

    attacker.challenge(cardUnderTest);

    expect(cardUnderTest.zone).toEqual("inkwell");
    expect(cardUnderTest.ready).toEqual(false);
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
  });
});
