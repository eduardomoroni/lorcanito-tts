/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { hakunaMatata } from "@lorcanito/engine/cards/TFC/songs/songs";
import {
  magicBroomBucketBrigade,
  moanaOfMotunui,
  teKaTheBurningOne,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Hakuna Matata", () => {
  it("Heals all characters", () => {
    const cardsInHand = [
      magicBroomBucketBrigade,
      teKaTheBurningOne,
      moanaOfMotunui,
    ];
    const testStore = new TestStore({
      play: cardsInHand,
      inkwell: hakunaMatata.cost,
      hand: [hakunaMatata],
    });
    cardsInHand.forEach((card, index) => {
      const cardModel = testStore.getByZoneAndId("play", card.id);
      cardModel.updateCardMeta({ damage: 3 });
      expect(cardModel.meta).toEqual(expect.objectContaining({ damage: 3 }));
    });

    testStore.store.playCardFromHand(
      testStore.getByZoneAndId("hand", hakunaMatata.id).instanceId,
    );

    cardsInHand.forEach((card) => {
      const cardModel = testStore.getByZoneAndId("play", card.id);
      expect(cardModel.meta.damage).toBeFalsy();
    });
  });
});
