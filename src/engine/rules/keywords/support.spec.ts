/**
 * @jest-environment node
 */
import { TestStore } from "~/engine/rules/testStore";
import { describe, expect } from "@jest/globals";
import {chiefTui, heiheiBoatSnack, moanaOfMotunui} from "~/engine/cards/TFC/characters/characters";

describe("Support keyword", () => {
  // TODO: Fix this
  it("**Support** _(Whenever this character quests, you may add their ※ to another chosen character‘s ※ this turn.)", () => {
    const testStore = new TestStore({
      play: [chiefTui, moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId("play", chiefTui.id);
    const supportedChar = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    expect(supportedChar.strength).toEqual(moanaOfMotunui.strength);

    cardUnderTest.quest();

    testStore.resolveTopOfStack({ targetId: supportedChar.instanceId });

    expect(supportedChar.strength).toEqual(
      (moanaOfMotunui?.strength || 0) + (chiefTui?.strength || 0)
    );
  });
});
