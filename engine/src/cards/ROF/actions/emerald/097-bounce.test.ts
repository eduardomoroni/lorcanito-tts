/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { bounce } from "@lorcanito/engine/cards/ROF/actions/actions";
import { cinderellaBallroomSensation } from "@lorcanito/engine/cards/ROF/characters/characters";
import { liloGalacticHero } from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Bounce", () => {
  it("Return chosen character of yours to your hand to return another chosen character to their player's hand.", () => {
    const testStore = new TestStore(
      {
        inkwell: bounce.cost,
        hand: [bounce],
        play: [cinderellaBallroomSensation],
      },
      {
        play: [liloGalacticHero],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", bounce.id);
    const target = testStore.getByZoneAndId(
      "play",
      cinderellaBallroomSensation.id,
    );
    const opponentTarget = testStore.getByZoneAndId(
      "play",
      liloGalacticHero.id,
      "player_two",
    );

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targets: [target] }, true);
    testStore.resolveTopOfStack({ targets: [opponentTarget] });

    expect(target.zone).toEqual("hand");
    expect(opponentTarget.zone).toEqual("hand");
  });
});
