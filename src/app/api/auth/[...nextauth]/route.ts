import NextAuth from "next-auth";
import { authOptions } from "~/server/auth";
import { cookies } from "next/headers";
import { type NextRequest, type NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

// https://next-auth.js.org/configuration/initialization#route-handlers-app
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions);

async function PATCH(req: NextRequest, res: NextResponse) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({ id: session.user.id });
}

export { handler as GET, handler as POST, PATCH };
