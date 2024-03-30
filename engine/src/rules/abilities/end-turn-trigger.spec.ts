/**
 * @jest-environment node
 */

import {
  LorcanitoCharacterCard,
  CardEffectTarget,
  BanishEffect,
  allCardsById,
} from "@lorcanito/engine";
import { characterMock } from "@lorcanito/engine/__mocks__/characterMock";
import { atTheEndOfYourTurn } from "@lorcanito/engine/rules/abilities/abilities";
import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { drFacilierSavvyOpportunist } from "@lorcanito/engine/cards/ROF/characters/characters";

const targetTriggerCard: CardEffectTarget = {
  type: "card",
  value: "all",
  // This should target the trigger card
  filters: [{ filter: "source", value: "trigger" }],
};

const banishSelf: BanishEffect = {
  type: "banish",
  target: targetTriggerCard,
};

const atEndOfTurnBanishItself = atTheEndOfYourTurn({
  effects: [banishSelf],
  target: targetTriggerCard,
});

export const testCard: LorcanitoCharacterCard = {
  ...characterMock,
  abilities: [atEndOfTurnBanishItself],
};

allCardsById[testCard.id] = testCard;

describe("End of turn trigger", () => {
  it("target a specific char during evaluation of the trigger", () => {
    const testStore = new TestStore(
      {
        play: [testCard, drFacilierSavvyOpportunist],
      },
      {
        deck: 1,
      },
    );

    const cardUnderTest = testStore.getByZoneAndId("play", testCard.id);
    const notTarget = testStore.getByZoneAndId(
      "play",
      drFacilierSavvyOpportunist.id,
    );

    testStore.passTurn();

    expect(cardUnderTest.zone).toEqual("discard");
    expect(notTarget.zone).toEqual("play");
  });
});
