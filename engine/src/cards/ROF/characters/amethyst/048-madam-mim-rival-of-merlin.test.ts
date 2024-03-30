/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  drFacilierSavvyOpportunist,
  madamMimRivalOfMerlin,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Madam Mim - Rival of Merlin", () => {
  it("**GRUESOME AND GRIM** ↷ − Play a character with cost 4 or less for free. They gain **Rush**. At the end of the turn, banish them. _They can challenge the turn they're played._'", () => {
    const testStore = new TestStore(
      {
        hand: [drFacilierSavvyOpportunist],
        play: [madamMimRivalOfMerlin],
      },
      {
        deck: 2,
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      madamMimRivalOfMerlin.id,
    );
    const target = testStore.getByZoneAndId(
      "hand",
      drFacilierSavvyOpportunist.id,
    );

    cardUnderTest.activate();
    testStore.resolveTopOfStack({ targets: [target] }, true);

    expect(target.zone).toEqual("play");
    expect(target.hasRush).toEqual(true);

    testStore.passTurn();

    expect(target.zone).toEqual("discard");
  });

  it("Shift", () => {
    const testStore = new TestStore({
      play: [madamMimRivalOfMerlin],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      madamMimRivalOfMerlin.id,
    );

    expect(cardUnderTest.hasShift).toEqual(true);
  });
});
