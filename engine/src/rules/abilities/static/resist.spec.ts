/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  owlLogicalLecturer,
  thePrinceNeverGivesUp,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { fireTheCannons } from "@lorcanito/engine/cards/TFC/actions/actions";
import { grabYourSword } from "@lorcanito/engine/cards/TFC/songs/songs";
import { mouseArmor } from "@lorcanito/engine/cards/ROF/items/items";

describe("Resist", () => {
  it("Resist 1 - Single Target damage cards", () => {
    const testStore = new TestStore({
      play: [thePrinceNeverGivesUp],
      inkwell: fireTheCannons.cost,
      hand: [fireTheCannons],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", fireTheCannons.id);
    const target = testStore.getByZoneAndId("play", thePrinceNeverGivesUp.id);

    cardUnderTest.playFromHand();

    testStore.resolveTopOfStack({
      targets: [target],
    });

    expect(target.meta).toEqual(expect.objectContaining({ damage: 1 }));
  });

  it("Resist 1 - multi target damage cards", () => {
    const testStore = new TestStore(
      {
        inkwell: grabYourSword.cost,
        hand: [grabYourSword],
      },
      {
        play: [thePrinceNeverGivesUp],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", grabYourSword.id);
    const target = testStore.getByZoneAndId(
      "play",
      thePrinceNeverGivesUp.id,
      "player_two",
    );

    cardUnderTest.playFromHand();

    expect(target.meta).toEqual(expect.objectContaining({ damage: 1 }));
  });

  it("Resit 1 - challenging a character", () => {
    const testStore = new TestStore(
      {
        play: [thePrinceNeverGivesUp],
      },
      {
        play: [owlLogicalLecturer],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      thePrinceNeverGivesUp.id,
    );
    const opponent = testStore.getByZoneAndId(
      "play",
      owlLogicalLecturer.id,
      "player_two",
    );

    opponent.updateCardMeta({ exerted: true });

    cardUnderTest.challenge(opponent);

    expect(cardUnderTest.meta).toEqual(
      expect.objectContaining({ damage: opponent.strength - 1 }),
    );
  });

  it("Resist 1 - being challenged", () => {
    const testStore = new TestStore(
      {
        play: [owlLogicalLecturer],
      },
      {
        play: [thePrinceNeverGivesUp],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      thePrinceNeverGivesUp.id,
      "player_two",
    );
    const opponent = testStore.getByZoneAndId("play", owlLogicalLecturer.id);

    cardUnderTest.updateCardMeta({ exerted: true });

    opponent.challenge(cardUnderTest);

    expect(cardUnderTest.meta).toEqual(
      expect.objectContaining({ damage: opponent.strength - 1 }),
    );
  });

  it("Gained Resist", () => {
    const testStore = new TestStore(
      {
        play: [owlLogicalLecturer, mouseArmor],
      },
      {
        play: [thePrinceNeverGivesUp],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      owlLogicalLecturer.id,
    );
    const opponent = testStore.getByZoneAndId(
      "play",
      thePrinceNeverGivesUp.id,
      "player_two",
    );
    const item = testStore.getByZoneAndId("play", mouseArmor.id);

    item.activate();
    testStore.resolveTopOfStack({ targets: [cardUnderTest] });

    cardUnderTest.updateCardMeta({ exerted: true });

    opponent.challenge(cardUnderTest);

    expect(cardUnderTest.meta).toEqual(
      expect.objectContaining({ damage: opponent.strength - 1 }),
    );
  });
});
