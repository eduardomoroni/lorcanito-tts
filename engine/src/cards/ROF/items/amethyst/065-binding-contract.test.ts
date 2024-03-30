/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { bindingContract } from "@lorcanito/engine/cards/ROF/items/items";
import {
  grandDukeAdvisorToTheKing,
  pigletVerySmallAnimal,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Binding Contract", () => {
  it("**FOR ALL ETERNITY** ↷, ↷ one of your characters − Exert chosen character.", () => {
    const testStore = new TestStore(
      {
        play: [bindingContract, grandDukeAdvisorToTheKing],
      },
      {
        play: [pigletVerySmallAnimal],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("play", bindingContract.id);
    const cardToPayCost = testStore.getByZoneAndId(
      "play",
      grandDukeAdvisorToTheKing.id,
    );
    const target = testStore.getByZoneAndId(
      "play",
      pigletVerySmallAnimal.id,
      "player_two",
    );

    expect(target.ready).toEqual(true);
    expect(cardToPayCost.ready).toEqual(true);

    cardUnderTest.activate("For All Eternity", { costs: [cardToPayCost] });
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.ready).toEqual(false);
    expect(cardToPayCost.ready).toEqual(false);
  });
});
