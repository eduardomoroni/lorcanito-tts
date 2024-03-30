/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { peterPansDagger } from "@lorcanito/engine/cards/ROF/items/items";
import {
  drFacilierSavvyOpportunist,
  jafarRoyalVizier,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Peter Pan's Dagger", () => {
  it("[Native ability] Your characters with **Evasive** get +1 ※.", () => {
    const testStore = new TestStore({
      play: [peterPansDagger, drFacilierSavvyOpportunist],
    });

    const target2 = testStore.getByZoneAndId(
      "play",
      drFacilierSavvyOpportunist.id,
    );

    [target2].forEach((card) => {
      expect(card.hasEvasive).toEqual(true);
      expect(card.strength).toEqual((card.lorcanitoCard?.strength || 0) + 1);
    });
  });

  it.failing(
    "[Gained ability] Your characters with **Evasive** get +1 ※.",
    () => {
      const testStore = new TestStore({
        play: [peterPansDagger, jafarRoyalVizier],
      });

      const target = testStore.getByZoneAndId("play", jafarRoyalVizier.id);

      [target].forEach((card) => {
        expect(card.hasEvasive).toEqual(true);
        expect(target.strength).toEqual(
          (card.lorcanitoCard?.strength || 0) + 1,
        );
      });
    },
  );
});
