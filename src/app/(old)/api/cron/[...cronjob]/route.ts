import { NextResponse } from "next/server";
import { purgeGames } from "~/3rd-party/firebase/database/game";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  context: { params: { cronjob: string[] } }
) {
  const job = context.params?.cronjob?.[0];

  const url = new URL(request.url);
  // @ts-ignore
  const searchParams = url.searchParams || request.nextUrl?.searchParams;
  const secret = searchParams.get("password");

  if (job === "purge_games") {
    if (
      secret !== process.env.FIREBASE_PRIVATE_CLEANUP_SECRET &&
      process.env.NODE_ENV !== "development"
    ) {
      console.log("Unauthorized access to purge_games");
      return NextResponse.json({}, { status: 401 });
    }

    const removed: string[] = await purgeGames();
    console.log(`Removed ${removed.length} items:`);
    console.log(removed.filter(Boolean));

    return NextResponse.json(
      {
        body: removed,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: request.body,
    },
    { status: 200 }
  );
}
