import React from "react";
import { authOptions } from "~/server/auth";
import { adminDatabase } from "~/3rd-party/firebase/admin";
import { type GameLobby } from "~/libs/game";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { createStreamClientToken } from "~/server/api/routers/chat";
import { getOrCreateGame } from "~/3rd-party/firebase/database/game";

export const metadata = {
  description: "Lorcanito game lobby.",
};

const LobbyPageProviders = dynamic(() => import("./LobbyPageProviders"), {
  // TODO: I NEED TO INVESTIGATE WHEN I HAVE TIME
  ssr: false,
  loading: () => <p>Loading your game...</p>,
});

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
  const game = await getOrCreateGame(lobbyId);

  if (!lobby) {
    return <span> Lobby not found, please try again</span>;
  }
  const streamToken = await createStreamClientToken(userUid || "");

  return (
    <LobbyPageProviders
      lobby={lobby}
      game={game}
      userId={userUid}
      streamToken={streamToken}
    />
  );
}
