import { NextResponse } from "next/server";

export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";
export const runtime = "nodejs";
export const preferredRegion = "auto";

export async function GET(
  request: Request,
  context: { params: { deckId: Array<string> } }
) {
  const deckId = context.params?.deckId?.[0];

  if (!deckId) {
    return NextResponse.json(
      {
        message: "missing deck id",
        id: deckId,
      },
      { status: 400 }
    );
  }

  const response = await fetch(
    `http://localhost:3000/api/lorcania/deck/${deckId}`,
    {
      // cache: "force-cache",
      next: { revalidate: false },
    }
  );

  if (!response.ok) {
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  }

  return NextResponse.json(await response.json(), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, s-maxage=1200, stale-while-revalidate=600",
    },
  });
}
