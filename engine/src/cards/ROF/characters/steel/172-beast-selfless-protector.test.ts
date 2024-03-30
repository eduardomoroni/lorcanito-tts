/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { beastSelflessProtector } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Beast - Selfless Protector", () => {
  it("**SHIELD ANOTHER** Whenever one of your other characters would be dealt damage, put that many damage counters on this character instead.", () => {
    const testStore = new TestStore({
      play: [beastSelflessProtector],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      beastSelflessProtector.id,
    );

    expect(cardUnderTest.hasProtector).toEqual(true);
  });
});
