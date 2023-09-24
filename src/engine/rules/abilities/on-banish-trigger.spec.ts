/**
 * @jest-environment node
 */
import { cheshireCatNotAllThereTestCase } from "~/engine/cards/TFC/characters/green/071-cheshire-cat-not-all-there.spec";
import { teKaHeartlessTestCase } from "~/engine/cards/TFC/characters/silver/192-te-ka-heartless.spec";
import { princePhillipTestCase } from "~/engine/cards/TFC/characters/yellow/016-prince-phillip-dragon-slayer.spec";

describe("On Banish in a challenge", () => {
  it.only("Whenever this character banishes another character in a challenge", () => {
    teKaHeartlessTestCase();
  });

  it("Whenever one of your characters with (...) is banished", () => {});

  it("When this character challenges and is banished", () => {
    princePhillipTestCase();
  });

  it("When this character is challenged and banished", () => {
    cheshireCatNotAllThereTestCase();
  });

  describe("Whenever one of your other characters is banished in a challenge", () => {});
});
