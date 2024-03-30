import { NextResponse } from "next/server";
import { getCardFullName } from "~/client/table/deckbuilder/parseDeckList";

type DreambornCards = Array<{ name: string; title: string }>;

type DreamBornDeck = {
  cards: DreambornCards;
};

function fromDreambornToLorcanito(dreambornDeck: DreamBornDeck): string[] {
  const cards: DreambornCards = dreambornDeck?.cards || [];
  // @ts-ignore
  return cards.map((card) => `1 ${getCardFullName(card)}`);
}

export async function GET(
  request: Request,
  context: { params: { id: Array<string> } },
) {
  const deckId = context.params?.id?.[0];

  if (!deckId) {
    return NextResponse.json(
      {
        message: "missing deck id",
        id: deckId,
      },
      { status: 400 },
    );
  }

  const response = await fetch(`https://dreamborn.ink/api/tts/decks/${deckId}`);
  console.log("response", response);
  // parsing the payload is failing in this case, thus the empty response
  if (!response.ok) {
    return NextResponse.json({}, { status: response.status });
  }

  const dreambornDeck = (await response.json()) as DreamBornDeck;
  console.log("dreambornDeck", dreambornDeck);
  return NextResponse.json(fromDreambornToLorcanito(dreambornDeck), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, s-maxage=1200, stale-while-revalidate=600",
    },
  });
}
