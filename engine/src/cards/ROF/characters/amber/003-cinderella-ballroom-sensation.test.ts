/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { cinderellaBallroomSensation } from "@lorcanito/engine/cards/ROF/characters/characters";

describe("Cinderella - Ballroom Sensation", () => {
  it("Singer", () => {
    const testStore = new TestStore({
      play: [cinderellaBallroomSensation],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      cinderellaBallroomSensation.id,
    );

    expect(cardUnderTest.hasSinger).toEqual(true);
  });
});
