/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import {
  magicBroomBucketBrigade,
  moanaOfMotunui,
  teKaTheBurningOne,
} from "~/engine/cards/TFC";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { grabYourSword } from "~/engine/cards/TFC/songs";

describe("Grab Your Sword", () => {
  it("Damages all opponent's characters", () => {
    const opponentsCards = [
      magicBroomBucketBrigade,
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
      }
    );

    testStore.store.playCardFromHand(
      testStore.getByZoneAndId("hand", grabYourSword.id).instanceId
    );

    opponentsCards.forEach((card) => {
      const cardModel = testStore.getByZoneAndId("play", card.id, "player_two");
      expect(cardModel.meta.damage).toEqual(2);
    });
  });
});
