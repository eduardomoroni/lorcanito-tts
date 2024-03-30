/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  mauriceWorldFamousInventor,
  grammaTalaStoryteller,
} from "@lorcanito/engine/cards/TFC/characters/characters";
import {
  docLeaderOfTheSevenDwarfs,
  dopeyAlwaysPlayful,
  kuzcoWantedLlama,
  owlLogicalLecturer,
  sleepyNoddingOff,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { smash } from "@lorcanito/engine/cards/TFC/actions/actions";

describe("When this character is banished", () => {
  it("**I WILL BE WITH YOU** When this character is banished, you may put this card into your inkwell facedown and exerted.", () => {
    const testStore = new TestStore(
      {
        inkwell: grammaTalaStoryteller.cost,
        play: [grammaTalaStoryteller],
      },
      {
        play: [mauriceWorldFamousInventor],
      },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      grammaTalaStoryteller.id,
    );

    cardUnderTest.updateCardMeta({ exerted: true });
    const attacker = testStore.getByZoneAndId(
      "play",
      mauriceWorldFamousInventor.id,
      "player_two",
    );

    attacker.challenge(cardUnderTest);

    testStore.resolveOptionalAbility();

    expect(cardUnderTest.zone).toEqual("inkwell");
    expect(cardUnderTest.ready).toEqual(false);
    expect(testStore.store.stackLayerStore.layers).toHaveLength(0);
  });

  it("[Kuzco - Wanted Llama] Does not draw when opponent is banished in a challenge", () => {
    const testStore = new TestStore(
      {
        deck: 2,
        play: [kuzcoWantedLlama],
      },
      { play: [owlLogicalLecturer] },
    );

    const cardUnderTest = testStore.getByZoneAndId("play", kuzcoWantedLlama.id);

    cardUnderTest.updateCardMeta({ exerted: true });
    const attacker = testStore.getByZoneAndId(
      "play",
      owlLogicalLecturer.id,
      "player_two",
    );

    attacker.challenge(cardUnderTest);
    testStore.resolveOptionalAbility(true);

    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({
        hand: 1,
        discard: 1,
        deck: 1,
      }),
    );
  });

  it("[Dopey - Always Playful] Does not trigger when banishing other char", () => {
    const testStore = new TestStore(
      {
        inkwell: smash.cost,
        hand: [smash],
        deck: 1,
        play: [dopeyAlwaysPlayful, sleepyNoddingOff, docLeaderOfTheSevenDwarfs],
      },
      { deck: 1 },
    );

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      dopeyAlwaysPlayful.id,
    );
    const sleepy = testStore.getByZoneAndId("play", sleepyNoddingOff.id);
    const doc = testStore.getByZoneAndId("play", docLeaderOfTheSevenDwarfs.id);

    testStore.fromZone("hand", smash).playFromHand();
    testStore.resolveTopOfStack({ targets: [sleepy] });

    expect(sleepy.zone).toEqual("discard");
    [doc, cardUnderTest].forEach((card) => {
      expect(card.strength).toEqual(card.lorcanitoCard.strength || 0);
    });
  });
});
