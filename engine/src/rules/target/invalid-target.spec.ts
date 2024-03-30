/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  beastHardheaded,
  magicBroomBucketBrigade,
} from "@lorcanito/engine/cards/TFC/characters/characters";
import { judyHoppsOptimisticOfficer } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Invalid Target", () => {
  it("On play effect, with NO item valid target", () => {
    const testStore = new TestStore(
      {
        inkwell: beastHardheaded.cost,
        hand: [beastHardheaded],
      },
      {
        hand: [magicBroomBucketBrigade],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("hand", beastHardheaded.id);

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility(true);

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    expect(cardUnderTest.zone).toEqual("play");
  });

  it("[Judy Hopps] On play effect, with NO item valid target", () => {
    const testStore = new TestStore({
      inkwell: judyHoppsOptimisticOfficer.cost,
      hand: [judyHoppsOptimisticOfficer],
      deck: 2,
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      judyHoppsOptimisticOfficer.id,
    );

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility(true);

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        deck: 2,
        play: 1,
      }),
    );
  });

  // it("[Painting the Roses Red] 'up to' target should not be required", () => {
  //   const testStore = new TestStore({
  //     inkwell: paintingTheRosesRed.cost,
  //     hand: [paintingTheRosesRed],
  //     deck: 1,
  //   });
  //
  //   const cardUnderTest = testStore.getByZoneAndId(
  //     "hand",
  //     paintingTheRosesRed.id,
  //   );
  //
  //   cardUnderTest.playFromHand();
  //   testStore.resolveTopOfStack({ targets: [] });
  //
  //   expect(testStore.getZonesCardCount()).toEqual(
  //     expect.objectContaining({
  //       hand: 1,
  //       deck: 0,
  //     }),
  //   );
  // });
});
