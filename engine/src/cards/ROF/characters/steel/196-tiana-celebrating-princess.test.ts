/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { tianaCelebratingPrincess } from "@lorcanito/engine/cards/ROF/characters/characters";
import { grabYourSword } from "@lorcanito/engine/cards/TFC/songs/songs";

describe("Tiana- Celebrating Princess", () => {
  it("Resist 2", () => {
    const testStore = new TestStore({
      play: [tianaCelebratingPrincess],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      tianaCelebratingPrincess.id,
    );

    expect(cardUnderTest.hasResist).toEqual(true);
  });

  describe("**WHAT YOU GIVE IS WHAT YOU GET** While this character is exerted and you have no cards in your hand, opponents can’t play actions.", () => {
    it("Exerted, No Cards in Hand", () => {
      const testStore = new TestStore(
        { hand: [grabYourSword], inkwell: grabYourSword.cost },
        {
          play: [tianaCelebratingPrincess],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        tianaCelebratingPrincess.id,
        "player_two",
      );
      cardUnderTest.updateCardMeta({ exerted: true });

      const actionCard = testStore.getByZoneAndId("hand", grabYourSword.id);
      actionCard.playFromHand();

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          discard: 0,
          hand: 1,
        }),
      );
    });

    it("Exerted, With Cards in Hand", () => {
      const testStore = new TestStore(
        { hand: [grabYourSword], inkwell: grabYourSword.cost },
        {
          play: [tianaCelebratingPrincess],
          hand: 1,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        tianaCelebratingPrincess.id,
        "player_two",
      );
      cardUnderTest.updateCardMeta({ exerted: true });

      const actionCard = testStore.getByZoneAndId("hand", grabYourSword.id);
      actionCard.playFromHand();

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          discard: 1,
          hand: 0,
        }),
      );
    });

    it("Ready, No Cards in Hand", () => {
      const testStore = new TestStore(
        { hand: [grabYourSword], inkwell: grabYourSword.cost },
        {
          play: [tianaCelebratingPrincess],
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        tianaCelebratingPrincess.id,
        "player_two",
      );
      cardUnderTest.updateCardMeta({ exerted: false });

      const actionCard = testStore.getByZoneAndId("hand", grabYourSword.id);
      actionCard.playFromHand();

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          discard: 1,
          hand: 0,
        }),
      );
    });

    it("Ready, With Cards in Hand", () => {
      const testStore = new TestStore(
        { hand: [grabYourSword], inkwell: grabYourSword.cost },
        {
          play: [tianaCelebratingPrincess],
          hand: 1,
        },
      );

      const cardUnderTest = testStore.getByZoneAndId(
        "play",
        tianaCelebratingPrincess.id,
        "player_two",
      );
      cardUnderTest.updateCardMeta({ exerted: false });

      const actionCard = testStore.getByZoneAndId("hand", grabYourSword.id);
      actionCard.playFromHand();

      expect(testStore.getZonesCardCount()).toEqual(
        expect.objectContaining({
          discard: 1,
          hand: 0,
        }),
      );
    });
  });
});
