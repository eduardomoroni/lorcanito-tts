// TODO: caching is not working for this route
import { NextResponse } from "next/server";
import { Deck } from "~/spaces/providers/TabletopProvider";

function fromLocarniaToLorcanito(lorcaniaDeck: unknown): string[] {
  // @ts-ignore
  const cards = Object.values(lorcaniaDeck?.deck?.deck?.cards || {}) || [];
  // @ts-ignore
  const cardCount = lorcaniaDeck?.deck?.deck?.cardsPerID;

  return cards.map((card) => {
    // @ts-ignore
    const qty = cardCount[card.id] || 0;
    // @ts-ignore
    if (card.title && card.name) {
      // @ts-ignore
      return `${qty} ${card.name} - ${card.title}`;
    } else {
      // @ts-ignore
      return `${qty} ${card.name}`;
    }
  });
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

  const response = await fetch(`https://lorcania.com/api/decks/${deckId}`, {
    // cache: "force-cache",
    next: { revalidate: false },
  });

  // parsing the payload is failing in this case, thus the empty response
  if (!response.ok) {
    return NextResponse.json({}, { status: response.status });
  }

  return NextResponse.json(fromLocarniaToLorcanito(await response.json()), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, s-maxage=1200, stale-while-revalidate=600",
    },
  });
}
