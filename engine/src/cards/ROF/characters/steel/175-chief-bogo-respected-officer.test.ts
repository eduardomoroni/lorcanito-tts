/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  chiefBogoRespectedOfficer,
  herculesDivineHero,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { liloGalacticHero } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Chief Bogo- Respected Officer", () => {
  it("**INSUBORDINATION!** Whenever you play a Floodborn character, deal 1 damage to each opposing character.", () => {
    const testStore = new TestStore(
      {
        inkwell: herculesDivineHero.cost,
        hand: [herculesDivineHero],
        play: [chiefBogoRespectedOfficer],
      },
      {
        play: [liloGalacticHero],
      },
    );

    const floodbornChar = testStore.getByZoneAndId(
      "hand",
      herculesDivineHero.id,
    );
    const target = testStore.getByZoneAndId(
      "play",
      liloGalacticHero.id,
      "player_two",
    );

    floodbornChar.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] });

    expect(target.damage).toEqual(1);
  });
});
