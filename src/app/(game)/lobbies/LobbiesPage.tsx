"use client";

import React, { type FC, useEffect, useState } from "react";

import { useStreamChat } from "~/providers/stream-chat-provider/StreamChatLobbiesProvider";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  Thread,
  VirtualizedMessageList,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { LobbyList } from "~/app/(game)/lobbies/LobbyList";
import { Button } from "~/components/button/Button";

export const LobbiesPage: FC = (props) => {
  const { client, channel } = useStreamChat();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={"flex h-full w-full justify-between p-10 pt-12"}>
      <div className="mr-10 flex w-2/3">
        <div className="w-full overflow-y-auto rounded-lg bg-white  p-2">
          <LobbyList />
        </div>
      </div>
      <div className="flex flex-col">
        <Button
          href="/lobby/"
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
          className={
            "item-center my-4 flex w-full justify-center !bg-indigo-500 py-2 font-mono !text-xl uppercase hover:!bg-indigo-600"
          }
        >
          {isLoading ? "Loading..." : "Create a lobby"}
        </Button>
        {client ? (
          <Chat client={client} theme="str-chat__theme-dark">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <VirtualizedMessageList hideDeletedMessages />
                <MessageInput
                  noFiles
                  closeEmojiPickerOnClick
                  grow
                  publishTypingEvent
                />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        ) : null}
      </div>
    </div>
  );
};
