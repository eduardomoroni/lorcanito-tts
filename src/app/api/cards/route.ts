import { NextResponse } from "next/server";
import { allCards } from "@lorcanito/engine";
import type { LorcanitoCard } from "@lorcanito/engine";

export const revalidate = 60 * 60 * 24;

export async function GET(request: Request) {
  function mapper(card: LorcanitoCard) {
    if (card.title) {
      return `${card.name} - ${card.title}`;
    }

    return card.name;

    // return {
    //   name: `${card.name} - ${card.title}`,
    //   number: card.number,
    //   set: card.set,
    // };
  }

  const notImplemented = allCards
    .filter((card) => !card.implemented)
    .map(mapper);
  const implementedCount = allCards
    .filter((card) => card.implemented)
    .map(mapper);

  return NextResponse.json(
    {
      body: {
        total: allCards.length,
        notImplementedCount: notImplemented.length,
        implementedCount: implementedCount.length,
        list: {
          notImplemented: notImplemented.sort(),
          implemented: implementedCount.sort(),
        },
      },
    },
    { status: 200 },
  );
}
