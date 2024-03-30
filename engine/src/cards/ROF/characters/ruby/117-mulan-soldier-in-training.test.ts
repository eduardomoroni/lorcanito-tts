/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { mulanSoldierInTraining } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Mulan - Soldier in Training", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: mulanSoldierInTraining.cost,

      play: [mulanSoldierInTraining],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      mulanSoldierInTraining.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
