import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import type { NextRequest } from "next/server";
import { createGameLobby } from "~/libs/3rd-party/firebase/database/game";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // TODO: Move this to a centralised place
  const session = await getServerSession(authOptions);
  const userUid = session?.user?.uid;

  if (!userUid) {
    redirect(`/auth/signin`);
  }

  // TODO: Add a check here, as people can abuse this
  const newLobby = await createGameLobby(userUid);

  redirect(`/lobby/${newLobby.id}?${request.nextUrl?.searchParams}`);
}
