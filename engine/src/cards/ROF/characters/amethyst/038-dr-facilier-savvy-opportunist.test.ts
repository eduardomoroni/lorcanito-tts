/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { drFacilierSavvyOpportunist } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Dr. Facilier - Savvy Opportunist", () => {
  it.skip("Evasive", () => {
    const testStore = new TestStore({
      play: [drFacilierSavvyOpportunist],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      drFacilierSavvyOpportunist.id,
    );

    expect(cardUnderTest.hasEvasive).toBeTruthy();
  });
});
