/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";

import {
  megaraPullingTheStrings,
  mickeyMouseArtfulRogue,
} from "@lorcanito/engine/cards/TFC/characters/characters";
import { hakunaMatata } from "@lorcanito/engine/cards/TFC/songs/songs";

describe("Mickey Mouse - Artful Rogue", () => {
  it("**MISDIRECTION** Whenever you play an action, chosen opposing character can't quest during their next turn.", () => {
    const testStore = new TestStore(
      {
        inkwell: hakunaMatata.cost,
        hand: [hakunaMatata],
        play: [mickeyMouseArtfulRogue],
      },
      {
        play: [megaraPullingTheStrings],
      },
    );

    const actionCard = testStore.getByZoneAndId("hand", hakunaMatata.id);
    const target = testStore.getByZoneAndId(
      "play",
      megaraPullingTheStrings.id,
      "player_two",
    );

    actionCard.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.hasQuestRestriction).toEqual(true);
  });

  it("Shift", () => {
    const testStore = new TestStore({
      play: [mickeyMouseArtfulRogue],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      mickeyMouseArtfulRogue.id,
    );

    expect(cardUnderTest.hasShift).toEqual(true);
  });
});
