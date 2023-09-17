/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "~/engine/rule-engine/rules/testStore";
import {
  dingleHopper,
  magicMirror,
  ursulaCaldron,
} from "~/engine/cards/TFC/items";
import { pascalRapunzelCompanion } from "~/engine/cards/TFC";

describe("Pascal - Rapunzel's Companion", () => {
  it.skip("Peer Into The Depths", () => {
    const testStore = new TestStore({
      deck: [dingleHopper, magicMirror],
      play: [pascalRapunzelCompanion],
    });

    const cardUnderTest = testStore.getByZoneAndId(
      "play",
      pascalRapunzelCompanion.id
    );
  });
});
