/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import {
  aliceGrowingGirl,
  basilOfBakerStreet,
  docLeaderOfTheSevenDwarfs,
  dopeyAlwaysPlayful,
  grumpyBadTempered,
  happyGoodNatured,
  mulanFreeSpirit,
} from "@lorcanito/engine/cards/ROF/characters/characters";
import {
  merlinSelfAppointmentMentor,
  philoctetes,
} from "@lorcanito/engine/cards/TFC/characters/characters";

describe("Alice - Growing Girl", () => {
  it("**GOOD ADVICE** Your other characters gain **Support**.", () => {
    const testStore = new TestStore({
      play: [
        aliceGrowingGirl,
        docLeaderOfTheSevenDwarfs,
        dopeyAlwaysPlayful,
        grumpyBadTempered,
        happyGoodNatured,
      ],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", aliceGrowingGirl.id);
    const target = testStore.getByZoneAndId(
      "play",
      docLeaderOfTheSevenDwarfs.id,
    );
    const target2 = testStore.getByZoneAndId("play", dopeyAlwaysPlayful.id);
    const target3 = testStore.getByZoneAndId("play", grumpyBadTempered.id);
    const target4 = testStore.getByZoneAndId("play", happyGoodNatured.id);

    expect(cardUnderTest.hasSupport).toBe(false);
    [target, target2, target3, target4].forEach((char) => {
      expect(char.hasSupport).toBe(true);
    });
  });

  it("**WHAT DID I DO?** While this character has 10 ※ or more, she gets +4 ◆.", () => {
    const testStore = new TestStore({
      play: [
        aliceGrowingGirl,
        mulanFreeSpirit,
        basilOfBakerStreet,
        merlinSelfAppointmentMentor,
        philoctetes,
      ],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", aliceGrowingGirl.id);
    const target = testStore.getByZoneAndId("play", mulanFreeSpirit.id);
    const target2 = testStore.getByZoneAndId("play", basilOfBakerStreet.id);
    const target3 = testStore.getByZoneAndId(
      "play",
      merlinSelfAppointmentMentor.id,
    );
    const target4 = testStore.getByZoneAndId("play", philoctetes.id);

    expect(cardUnderTest.strength).toBe(1);
    expect(cardUnderTest.lore).toBe(1);

    [target, target2, target3, target4].forEach((char) => {
      expect(char.hasSupport).toBe(true);
      char.quest();
      testStore.resolveOptionalAbility();
      testStore.resolveTopOfStack({ targets: [cardUnderTest] });
    });

    expect(cardUnderTest.strength).toBeGreaterThan(10);
    expect(cardUnderTest.lore).toBe(5);
  });
});
