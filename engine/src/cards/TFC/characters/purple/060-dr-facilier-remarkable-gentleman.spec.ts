/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { hakunaMatata } from "@lorcanito/engine/cards/TFC/songs/songs";
import {
  arielSpectacularSinger,
  drFacilierRemarkable,
  heiheiBoatSnack,
  yzmaAlchemist,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Dr. Facilier - Remarkable Gentleman", () => {
  it("**DREAMS MADE REAL** Whenever you play a song, you may look at the top 2 cards of your deck. Put one on the top of your deck and the other on the bottom.", () => {
    const testStore = new TestStore({
      inkwell: hakunaMatata.cost,
      hand: [hakunaMatata],
      play: [drFacilierRemarkable],
      deck: [heiheiBoatSnack, yzmaAlchemist, arielSpectacularSinger],
    });

    const target = testStore.getByZoneAndId("hand", hakunaMatata.id);
    const first = testStore.getByZoneAndId("deck", arielSpectacularSinger.id);
    const second = testStore.getByZoneAndId("deck", yzmaAlchemist.id);

    target.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({ scry: { bottom: [first], top: [second] } });

    const deck = testStore.store.tableStore.getPlayerZoneCards(
      "player_one",
      "deck",
    );

    expect(deck[0]).toEqual(first);
    expect(deck[deck.length - 1]).toEqual(second);
  });
});
