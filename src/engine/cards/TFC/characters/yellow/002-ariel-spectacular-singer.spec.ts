/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rules/testStore";
import { friendsOnTheOtherSide } from "~/engine/cards/TFC/songs/songs";
import { shieldOfVirtue } from "~/engine/cards/TFC/items/items";
import { CardModel } from "~/engine/store/models/CardModel";
import {arielSpectacularSinger, chiefTui, heiheiBoatSnack} from "~/engine/cards/TFC/characters/characters";

describe("Ariel - Spectacular Singer", () => {
  it("MUSICAL DEBUT effect - Song Tutored", () => {
    const testStore = new TestStore({
      inkwell: arielSpectacularSinger.cost,
      hand: [arielSpectacularSinger],
      deck: [shieldOfVirtue, chiefTui, heiheiBoatSnack, friendsOnTheOtherSide],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      arielSpectacularSinger.id,
    );
    const first = testStore.getByZoneAndId("deck", shieldOfVirtue.id);
    const second = testStore.getByZoneAndId("deck", chiefTui.id);
    const third = testStore.getByZoneAndId("deck", heiheiBoatSnack.id);
    const fourth = testStore.getByZoneAndId("deck", friendsOnTheOtherSide.id);

    cardUnderTest.playFromHand();

    const bottom: CardModel[] = [first, second, third];

    testStore.resolveTopOfStack({ scry: { bottom, hand: [fourth] } });

    const deck = testStore.store.tableStore
      .getPlayerZoneCards("player_one", "deck")
      .map((card) => card.lorcanitoCard?.name);

    expect(fourth.zone).toEqual("hand");
    expect(deck).toEqual([
      ...bottom.reverse().map((card) => card.lorcanitoCard.name),
    ]);
    expect(cardUnderTest.zone).toEqual("play");
  });
});
