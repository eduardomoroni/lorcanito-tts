import { allITICards } from "@lorcanito/engine/cards/ITI";
import { LorcanitoCard } from "@lorcanito/engine/cards/cardTypes";
import fs from "fs";

const pluralizationMap = {
  action: "actions",
  location: "locations",
  character: "characters",
  song: "songs",
  item: "items",
};

function pad(num: number, size: number) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function kebapCaseFullName(name: string, title?: string) {
  let fullName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (title) {
    fullName += `-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }
  return fullName;
}

function toCamelCase(string: string) {
  return string.replace(/([-_][a-z])/g, (group: string) =>
    group.toUpperCase().replace("-", "").replace("_", ""),
  );
}

function camelCaseFullName(card: LorcanitoCard) {
  let cardName = card.name;

  if (card.title) {
    cardName = `${card.name} ${card.title}`;
  }

  cardName = cardName
    .replaceAll(" ", "_")
    .replaceAll("'", "")
    .replaceAll("!", "")
    .replaceAll("?", "")
    .replaceAll(".", "")
    .replaceAll("’", "")
    .toLowerCase();

  return toCamelCase(cardName);
}

function generateAbilityTest(card: LorcanitoCard, ability: string) {
  const testBody = `    const testStore = new TestStore({
      inkwell: ${camelCaseFullName(card)}.cost,
      ${card.type === "action" ? "hand" : "play"}: [${camelCaseFullName(card)}],
    });

    const cardUnderTest = testStore.getByZoneAndId("${
      card.type === "action" ? "hand" : "play"
    }", ${camelCaseFullName(card)}.id);

    cardUnderTest.playFromHand();
    testStore.resolveOptionalAbility();
    testStore.resolveTopOfStack({});`;

  return `   
    it.skip("${ability}", 
    () => {
${testBody}
  });`;
}

function generateTestTemplate(card: LorcanitoCard) {
  if (!card.abilities || card.abilities.length === 0) {
    throw new Error(`Card ${card.name} - ${card.title} is a vanilla card`);
  }

  return `/**
 * @jest-environment node
 */

import { describe, expect, it } from "@jest/globals";
import { TestStore } from "@lorcanito/engine/rules/testStore";
import { ${camelCaseFullName(card)} } from "@lorcanito/engine/cards/ITI/${
    pluralizationMap[card.type]
  }/${pluralizationMap[card.type]}";

describe("${card.name}${card.title ? " - " + card.title : ""}", () => {
${
  card.abilities
    ?.map((ability) =>
      generateAbilityTest(card, ability.name?.replaceAll("\n", "") || ""),
    )
    .join("\n") || ""
}
});`;
}

allITICards.forEach((card) => {
  const dir = `./src/cards/ITI/${pluralizationMap[card.type]}/${card.color}`;
  const fullName = kebapCaseFullName(card.name, card.title);
  const filename = `${dir}/${pad(card.number, 3)}-${fullName}.test.ts`;

  if (fs.existsSync(dir)) {
    console.log(filename);
    console.log("Skipping: Dir already exists");
    return;
  }

  try {
    console.log(filename);
    console.log(generateTestTemplate(card));
  } catch (e) {
    console.error(e);
    return;
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filename, generateTestTemplate(card));
});
