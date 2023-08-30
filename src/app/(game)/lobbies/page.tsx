import React from "react";
import { authOptions } from "~/server/auth";

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { createStreamClientToken } from "~/server/api/routers/chat";

export const metadata = {
  description: "Lorcanito Lobbies.",
};

const LobbyPageProviders = dynamic(() => import("./LobbiesProviders"), {
  // TODO: I NEED TO INVESTIGATE WHEN I HAVE TIME
  ssr: false,
  loading: () => <p>Loading lobbies.</p>,
});

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

  return <LobbyPageProviders userId={userUid} streamToken={streamToken} />;
}
