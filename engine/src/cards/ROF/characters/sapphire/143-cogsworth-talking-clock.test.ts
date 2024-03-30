/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  cogsworthTalkingClock,
  feliciaAlwaysHungry,
  tukTukWreckingBall,
} from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Cogsworth - Talking Clock", () => {
  it("**WAIT A MINUTE** Your character with **Reckless** gain “↷ − Gain 1 lore.”", () => {
    const testStore = new TestStore({
      play: [cogsworthTalkingClock, feliciaAlwaysHungry, tukTukWreckingBall],
    });

    const target = testStore.getByZoneAndId("play", feliciaAlwaysHungry.id);
    const target2 = testStore.getByZoneAndId("play", tukTukWreckingBall.id);

    expect(testStore.getPlayerLore()).toEqual(0);

    expect(target.ready).toEqual(true);
    expect(target.hasActivatedAbility).toEqual(true);

    target.activate();

    expect(target.ready).toEqual(false);
    expect(testStore.getPlayerLore()).toEqual(1);

    expect(target2.ready).toEqual(true);
    expect(target2.hasActivatedAbility).toEqual(true);

    target2.activate();

    expect(target2.ready).toEqual(false);
    expect(testStore.getPlayerLore()).toEqual(2);
  });
});
