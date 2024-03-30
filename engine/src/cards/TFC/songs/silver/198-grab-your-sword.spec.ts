/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { grabYourSword } from "@lorcanito/engine/cards/TFC/songs/songs";
import {
  magicBroomBucketBrigade,
  mickeyMouseTrueFriend,
  moanaOfMotunui,
  teKaTheBurningOne,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Grab Your Sword", () => {
  it("Damages all opponent's characters", () => {
    const opponentsCards = [
      mickeyMouseTrueFriend,
      teKaTheBurningOne,
      moanaOfMotunui,
    ];
    const testStore = new TestStore(
      {
        inkwell: grabYourSword.cost,
        hand: [grabYourSword],
      },
      {
        play: opponentsCards,
      },
    );

    testStore.store.playCardFromHand(
      testStore.getByZoneAndId("hand", grabYourSword.id).instanceId,
    );

    opponentsCards.forEach((card) => {
      const cardModel = testStore.getByZoneAndId("play", card.id, "player_two");
      expect(cardModel.meta.damage).toEqual(2);
    });
  });
});
