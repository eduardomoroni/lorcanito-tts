/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  buckySquirrelSqueakTutor,
  herculesDivineHero,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { liloGalacticHero } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Bucky - Squirrel Squeak Tutor", () => {
  it("**SQUEAK** Whenever you play a Floodborn character, each opponent chooses and discards a card.", () => {
    const testStore = new TestStore(
      {
        inkwell: herculesDivineHero.cost,
        hand: [herculesDivineHero],
        play: [buckySquirrelSqueakTutor],
      },
      {
        hand: [liloGalacticHero],
      },
    );

    const floodbornChar = testStore.getByZoneAndId(
      "hand",
      herculesDivineHero.id,
    );
    const target = testStore.getByZoneAndId(
      "hand",
      liloGalacticHero.id,
      "player_two",
    );

    floodbornChar.playFromHand();
    expect(testStore.stackLayers).toHaveLength(1);
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.zone).toEqual("discard");
  });

  it("Ward", () => {
    const testStore = new TestStore({
      play: [buckySquirrelSqueakTutor],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      buckySquirrelSqueakTutor.id,
    );

    expect(cardUnderTest.hasWard).toEqual(true);
  });
});
