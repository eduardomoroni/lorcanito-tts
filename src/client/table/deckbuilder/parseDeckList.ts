import {
  type Deck,
  type DeckCard,
  type LorcanitoCard,
} from "@lorcanito/engine";
import { allCards } from "@lorcanito/engine";

export function getCardFullName(card: LorcanitoCard) {
  if ("title" in card && card.title) {
    return `${card.name.toLowerCase()} - ${card.title?.toLowerCase()}`;
  } else {
    return card.name.toLowerCase();
  }
}

export type ParseErrors = "quantity" | "card_not_found" | "missing_card_name";
type InvalidEntries = {
  line: string;
  invalid: true;
  error: ParseErrors;
};
const parseLine = (line: string): DeckCard | InvalidEntries => {
  const [qty, name] = line.split(" ");
  const quantity = parseInt(qty || "");

  if (isNaN(quantity)) {
    console.info("Line has an invalid card quantity");
    console.info(line);
    return { line, invalid: true, error: "quantity" };
  }

  if (!name) {
    console.info("Line has an invalid card name");
    console.info(line);
    return { line, invalid: true, error: "missing_card_name" };
  }

  const result = allCards.find((card) => {
    const original = getCardFullName(card)
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim();

    return line
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .includes(original);
  });

  if (!result) {
    console.info("Card not found");
    console.info(name);
    return { line, invalid: true, error: "card_not_found" };
  }

  // console.log("Parsing line: ", line);
  // console.log("Result: ", result);

  return {
    cardId: result.id,
    qty: quantity,
    card: result,
  };
};

export function parseDeckList(deckList: string): Deck {
  try {
    const parsedResult = deckList
      .split("\n")
      .filter((line) => !line.startsWith("//"))
      .map(parseLine);
    const deck: Deck = parsedResult.filter(
      (item) => !("invalid" in item),
    ) as Deck; // TODO: filter undefined in types

    return deck;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function invalidEntriesFromDeckList(deckList: string): InvalidEntries[] {
  const parsedResult = deckList
    .split("\n")
    .filter((line) => !line.startsWith("//"))
    .map(parseLine) as InvalidEntries[];

  return parsedResult
    .filter((item) => "invalid" in item)
    .filter((item) => item.line);
}
