/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { actionCardMock } from "@lorcanito/engine/__mocks__/actionCardMock";
import { allCardsById, LorcanitoActionCard } from "@lorcanito/engine";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { goofyKnightForADay } from "@lorcanito/engine/cards/ROF/characters/characters";
import { fourDozenEggs } from "@lorcanito/engine/cards/ROF/actions/actions";

const testCard: LorcanitoActionCard = {
  ...actionCardMock,
  abilities: [
    {
      type: "resolution",
      effects: [
        {
          type: "reveal-and-play",
          target: {
            type: "card",
            value: 1,
            filters: [
              { filter: "type", value: "character" },
              { filter: "owner", value: "self" },
            ],
          },
        },
      ],
    },
  ],
};

allCardsById[testCard.id] = testCard;

describe("Reveal and Play effect", () => {
  it("Let's player decide whether they want to play or not", () => {
    const testStore = new TestStore({
      inkwell: testCard.cost,
      hand: [testCard],
      deck: [goofyKnightForADay],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", testCard.id);
    const target = testStore.getByZoneAndId("deck", goofyKnightForADay.id);

    cardUnderTest.playFromHand();

    expect(testStore.stackLayers).toHaveLength(1);
    testStore.resolveOptionalAbility();

    expect(target.zone).toBe("play");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ deck: 0 }),
    );
  });

  it("Doesn't play the card if doesn't meet the filter", () => {
    const testStore = new TestStore({
      inkwell: testCard.cost,
      hand: [testCard],
      deck: [fourDozenEggs],
    });

    const cardUnderTest = testStore.getByZoneAndId("hand", testCard.id);
    const target = testStore.getByZoneAndId("deck", fourDozenEggs.id);

    cardUnderTest.playFromHand();
    expect(testStore.stackLayers).toHaveLength(0);

    expect(target.zone).toBe("deck");
    expect(testStore.getZonesCardCount()).toEqual(
      expect.objectContaining({ deck: 1 }),
    );
  });
});
