import React from "react";
import { authOptions } from "~/server/auth";
import { adminDatabase } from "~/libs/3rd-party/firebase/admin";
import { type GameLobby } from "~/libs/game";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { createStreamClientToken } from "~/server/api/routers/chat";
import LobbyPageProviders from "~/client/spaces/lobby/LobbyPageProviders";
import { joinLobby } from "~/server/lobbyActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  description: "Lorcanito game lobby.",
};

const getUserId = async () => {
  const session = await getServerSession(authOptions);
  const userUid = session?.user?.uid;
  if (!userUid) {
    redirect(`/auth/signin`);
  }

  return userUid;
};

const getLobby = async (lobbyId: string) => {
  if (!lobbyId) {
    redirect(`/`);
  }

  const dataSnapshot = await adminDatabase.ref(`lobbies/${lobbyId}`).get();
  const lobby = dataSnapshot.val() as GameLobby;

  if (!lobby) {
    redirect(`/not-found?lobbyId=${lobbyId}`);
  } else if (lobby.gameStarted) {
    redirect(`/game/${lobby.gameId}`);
  } else {
    return lobby;
  }
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

  const lobby = await getLobby(lobbyId);

  if (!lobby.players[userUid] && Object.keys(lobby.players).length <= 2) {
    await joinLobby(userUid, lobbyId);
  } else if (!lobby.players[userUid]) {
    return redirect(`/lobby-full`);
  }

  if (!lobby) {
    return <span> Lobby not found, please try again</span>;
  }
  const streamToken = await createStreamClientToken(userUid || "");

  console.log(lobby);

  return (
    <LobbyPageProviders
      lobby={lobby}
      userId={userUid}
      streamToken={streamToken}
    />
  );
}
