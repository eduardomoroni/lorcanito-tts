"use client";

import React, { type FC } from "react";
import { LobbiesPage } from "./LobbiesPage";
import { useFirebaseUserId } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { StreamChatProvider } from "~/client/providers/stream-chat-provider/StreamChatProvider";
import {
  LOBBIES_CHANNEL_ID,
  LOBBIES_CHANNEL_NAME,
} from "~/client/providers/stream-chat-provider/constants";

type Props = {
  userId: string;
  streamToken: string;
};

export const LobbiesProviders: FC<Props> = (props) => {
  const userId = useFirebaseUserId();

  if (!userId) {
    return (
      <span>
        Something went wrong with your authentication, please sign in again
      </span>
    );
  }

  return (
    <StreamChatProvider
      streamToken={props.streamToken}
      channelType="livestream"
      chatId={LOBBIES_CHANNEL_ID}
      chatName={LOBBIES_CHANNEL_NAME}
      players={[]}
      playerId={userId}
    >
      <LobbiesPage />
    </StreamChatProvider>
  );
};

export default LobbiesProviders;
