/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { mulanFreeSpirit } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Mulan - Free Spirit", () => {
  it.skip("", () => {
    const testStore = new TestStore({
      inkwell: mulanFreeSpirit.cost,

      play: [mulanFreeSpirit],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", mulanFreeSpirit.id);

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});
  });
});
