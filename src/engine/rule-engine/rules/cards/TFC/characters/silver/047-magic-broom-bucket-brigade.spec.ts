/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { createRuleEngine } from "~/engine/rule-engine/engine";
import {
  captainColonelsLieutenant,
  heiheiBoatSnack,
  magicBroomBucketBrigade,
  mickeyMouseTrueFriend,
  moanaOfMotunui,
} from "~/engine/cards/TFC";
import { createMockGame } from "~/engine/rule-engine/__mocks__/createGameMock";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
const testPlayer = "player_one";
const opponent = "player_two";

describe("Magic Broom - Bucket Brigade", () => {
  it("Weep effect - Own Discard", () => {
    const engine = createRuleEngine(
      createMockGame({
        inkwell: [magicBroomBucketBrigade, magicBroomBucketBrigade],
        hand: [magicBroomBucketBrigade],
        discard: [mickeyMouseTrueFriend, moanaOfMotunui],
      })
    );

    const cardUnderTest = engine.get.byZoneAndId({
      zone: "hand",
      lorcanitoId: magicBroomBucketBrigade.id,
      owner: testPlayer,
    });

    engine.moves.playCardFromHand(cardUnderTest);

    const cardsInPlay = engine.get.zoneCards("play", testPlayer);
    expect(cardsInPlay).toEqual(expect.arrayContaining([cardUnderTest]));
    expect(engine.get.effects()).toHaveLength(1);
    expect(engine.get.zoneCards("discard", testPlayer)).toHaveLength(2);

    const effect = engine.get.effects()[0];
    if (effect) {
      const cardToShuffle = engine.get.zoneCards("discard", testPlayer)[0];
      engine.moves.resolveEffect(effect?.id, { targetId: cardToShuffle });
    }
    expect(engine.get.zoneCards("discard", testPlayer)).toHaveLength(1);
  });

  it("Weep effect - Opponent's Discard", () => {
    const engine = createRuleEngine(
      createMockGame(
        {
          inkwell: [magicBroomBucketBrigade, magicBroomBucketBrigade],
          hand: [magicBroomBucketBrigade],
        },
        {
          discard: [mickeyMouseTrueFriend, moanaOfMotunui],
        }
      )
    );

    const cardUnderTest = engine.get.byZoneAndId({
      zone: "hand",
      lorcanitoId: magicBroomBucketBrigade.id,
      owner: testPlayer,
    });

    engine.moves.playCardFromHand(cardUnderTest);

    expect(engine.get.zoneCards("discard", opponent)).toHaveLength(2);

    const effect = engine.get.effects()[0];
    if (effect) {
      const cardToShuffle = engine.get.zoneCards("discard", opponent)[0];
      engine.moves.resolveEffect(effect?.id, { targetId: cardToShuffle });
    }
    expect(engine.get.zoneCards("discard", opponent)).toHaveLength(1);
  });

  it("Weep effect - Skipping", () => {
    const testStore = new TestStore(
      {
        inkwell: 2,
        discard: [heiheiBoatSnack, captainColonelsLieutenant],
        hand: [magicBroomBucketBrigade],
      },
      {
        discard: [mickeyMouseTrueFriend, moanaOfMotunui],
      }
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      magicBroomBucketBrigade.id
    );

    expect(testStore.getZonesCardCount("player_one").discard).toEqual(2);
    expect(testStore.getZonesCardCount("player_two").discard).toEqual(2);

    cardUnderTest.playFromHand();

    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);

    testStore.resolveTopOfStack({ skip: true });

    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
    expect(testStore.getZonesCardCount("player_two").discard).toEqual(2);
    expect(testStore.getZonesCardCount("player_one")).toEqual(
      expect.objectContaining({
        discard: 2,
        play: 1,
      })
    );
  });
});
