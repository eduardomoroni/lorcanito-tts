import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // TODO: Move this to a centralised place
  const session = await getServerSession(authOptions);
  const userUid = session?.user?.uid;

  if (!userUid) {
    redirect(`/auth/signin`);
  }

  redirect(`/game/${userUid}?${request.nextUrl?.searchParams}`);
}
