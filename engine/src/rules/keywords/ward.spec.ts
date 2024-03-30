/**
 * @jest-environment node
 */
import { it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { plasmaBlaster } from "@lorcanito/engine/cards/TFC/items/items";
import { expect } from "@jest/globals";
import {
  donaldDuckStruttingHisStuff,
  simbaFutureKing,
} from "@lorcanito/engine/cards/TFC/characters/characters";
import { fourDozenEggs } from "@lorcanito/engine/cards/ROF/actions/actions";
import {
  buckySquirrelSqueakTutor,
  theNokkWaterSpirit,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import { partOfOurWorld } from "@lorcanito/engine/cards/TFC/songs/songs";

describe("Ward keyword", () => {
  it("Effects that don't require a target can affect characters with ward", () => {
    const testStore = new TestStore({
      inkwell: fourDozenEggs.cost,
      hand: [fourDozenEggs],
      play: [theNokkWaterSpirit, buckySquirrelSqueakTutor],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", fourDozenEggs.id);
    const target = testStore.getByZoneAndId(
      "play",
      buckySquirrelSqueakTutor.id,
    );
    const anotherTarget = testStore.getByZoneAndId(
      "play",
      theNokkWaterSpirit.id,
    );

    cardUnderTest.playFromHand();

    [target, anotherTarget].forEach((character) => {
      expect(character.hasResist).toBe(true);
    });
  });

  it("should be able to target from hand", () => {
    const testStore = new TestStore({
      inkwell: simbaFutureKing.cost,
      hand: [theNokkWaterSpirit, simbaFutureKing],
      deck: 1,
    });

    const action = testStore.getByZoneAndId("hand", simbaFutureKing.id);
    const targetWithWard = testStore.getByZoneAndId(
      "hand",
      theNokkWaterSpirit.id,
    );

    action.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({ targets: [targetWithWard] });

    expect(targetWithWard.zone).toEqual("discard");
  });

  it("should be able to target from discard", () => {
    const testStore = new TestStore({
      inkwell: partOfOurWorld.cost,
      hand: [partOfOurWorld],
      discard: [buckySquirrelSqueakTutor],
    });

    const action = testStore.getByZoneAndId("hand", partOfOurWorld.id);
    const targetWithWard = testStore.getByZoneAndId(
      "discard",
      buckySquirrelSqueakTutor.id,
    );

    action.playFromHand();
    testStore.resolveTopOfStack({ targets: [targetWithWard] });

    expect(targetWithWard.zone).toEqual("hand");
    expect(action.zone).toEqual("discard");
  });

  it("Cannot target characters in play that has ward", () => {
    const testStore = new TestStore(
      {
        play: [plasmaBlaster],
        inkwell: 2,
      },
      {
        play: [donaldDuckStruttingHisStuff],
      },
    );

    const blaster = testStore.getByZoneAndId("play", plasmaBlaster.id);
    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      donaldDuckStruttingHisStuff.id,
      "player_two",
    );

    blaster.activate();

    testStore.resolveTopOfStack({ targets: [cardUnderTest] }, true);
    expect(cardUnderTest.meta.damage).toBeFalsy();

    // Effect doesn't resolve, letting the opponent to choose another target
    expect(testStore.store.stackLayerStore.layers).toHaveLength(1);
  });
});
