/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import { controlYourTemper } from "~/engine/cards/TFC/actions";
import { moanaOfMotunui } from "~/engine/cards/TFC";

describe("Attribute effect", () => {
  it("[Control Your Temper!] should not reduce attack to les than zero", () => {
    const testStore = new TestStore({
      inkwell: controlYourTemper.cost,
      hand: [controlYourTemper],
      play: [moanaOfMotunui],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "hand",
      controlYourTemper.id
    );
    const target = testStore.getByZoneAndId("play", moanaOfMotunui.id);

    cardUnderTest.playFromHand();
    testStore.resolveTopOfStack({ targetId: target.instanceId });

    expect(target.strength).toEqual(0);
  });
});
