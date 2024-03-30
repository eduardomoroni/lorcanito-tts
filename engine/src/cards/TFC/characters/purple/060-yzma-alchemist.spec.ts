/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { friendsOnTheOtherSide } from "@lorcanito/engine/cards/TFC/songs/songs";
import {
  arielSpectacularSinger,
  heiheiBoatSnack,
  yzmaAlchemist,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Yzma - Alchemist", () => {
  it("**YOU'RE EXCUSED** Whenever this character quests, look at the top card of your deck. Put it on either the top or the bottom of your deck.", () => {
    const testStore = new TestStore({
      play: [yzmaAlchemist],
      deck: [heiheiBoatSnack, friendsOnTheOtherSide, arielSpectacularSinger],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", yzmaAlchemist.id);
    const first = testStore.getByZoneAndId("deck", arielSpectacularSinger.id);

    cardUnderTest.quest();

    testStore.resolveTopOfStack({ scry: { bottom: [first] } });

    const deck = testStore.store.tableStore.getPlayerZoneCards(
      "player_one",
      "deck",
    );

    expect(deck[0]).toEqual(first);
  });
});
