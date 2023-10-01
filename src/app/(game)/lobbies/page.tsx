import React from "react";
import { authOptions } from "~/server/auth";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { createStreamClientToken } from "~/server/api/routers/chat";
import LobbiesProviders from "~/app/(game)/lobbies/LobbiesProviders";

export const metadata = {
  description: "Lorcanito Lobbies.",
};

const getUserId = async () => {
  const session = await getServerSession(authOptions);
  const userUid = session?.user?.uid;
  if (!userUid) {
    redirect(`/auth/signin`);
  }

  return userUid;
};

export default async function Lobby({ params }: { params: { id: string } }) {
  // TODO: Add cache to this
  const lobbyId = params.id;
  const userUid = await getUserId();
  // opt-out from caching
  const cookieStore = cookies();

  if (!userUid) {
    return <span> User not found, log out and log back in and try again</span>;
  }
  const streamToken = await createStreamClientToken(userUid || "");

  return <LobbiesProviders userId={userUid} streamToken={streamToken} />;
}
