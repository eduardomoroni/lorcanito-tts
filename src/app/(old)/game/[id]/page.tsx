import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { cookies } from "next/headers";

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// import GamePage from "~/app/game/[id]/actual";
import dynamic from "next/dynamic";
import { createStreamClientToken } from "~/server/api/routers/chat";
import { getFirestoreGame } from "~/libs/3rd-party/firebase/firestore";
import * as Sentry from "@sentry/nextjs";

const GamePage = dynamic(() => import("@/spaces/spaces/game/actual"), {
  ssr: false,
  loading: () => <p>Loading your game...</p>,
});

const getGame = async (gameId: string, userUid: string | undefined) => {
  if (!userUid) {
    redirect(`/auth/signin`);
  }

  if (!gameId) {
    redirect(`/lobbies`);
  }

  const game = await getFirestoreGame(gameId);

  if (!game) {
    redirect(`/not-found?lobbyId=${gameId}&userUid=${userUid}`);
  } else {
    return {
      props: { game },
    };
  }
};

const GameServerComponent = async ({ params }: { params: { id: string } }) => {
  const gameId = params.id;
  // TODO: Add cache to this
  const session = await getServerSession(authOptions);
  const userUid = session?.user?.uid;
  const props = await getGame(gameId, userUid);
  const streamToken = await createStreamClientToken(userUid || "");

  const game = props.props.game;
  const headersList = headers();
  // opt-out from caching
  const cookieStore = cookies();

  if (!game) {
    return <span> Game not found, please try again</span>;
  }
  let isMobile = false;

  try {
    const userAgent = headersList.get("user-agent");
    const ua = UAParser(userAgent || "");
    isMobile = ua.device.type === "mobile";
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
  }

  game.lastActivity = Date.now();

  // TODO: get player id
  return (
    <GamePage
      gameId={gameId}
      game={game}
      isMobile={isMobile}
      streamToken={streamToken}
    />
  );
};

export default GameServerComponent;
