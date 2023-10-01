"use client";

import React, { type FC } from "react";
import { LobbiesPage } from "./LobbiesPage";
import { useFirebaseUserId } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { StreamChatLobbiesProvider } from "~/spaces/providers/stream-chat-provider/StreamChatLobbiesProvider";

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
    <StreamChatLobbiesProvider streamToken={props.streamToken}>
      <LobbiesPage />
    </StreamChatLobbiesProvider>
  );
};

export default LobbiesProviders;
