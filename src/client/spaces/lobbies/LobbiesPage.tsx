"use client";

import React, { type FC, useState } from "react";

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
import { LobbyList } from "~/client/spaces/lobbies/LobbyList";
import { Button } from "~/client/components/button/Button";
import { useStreamGameChat } from "~/client/providers/stream-chat-provider/StreamChatProvider";

export const LobbiesPage: FC = (props) => {
  const { client, channel } = useStreamGameChat();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={"flex h-full w-full justify-between p-10 pt-12"}>
      <div className="mr-10 flex w-2/3">
        <div className="w-full overflow-y-auto rounded-lg p-2">
          <LobbyList />
        </div>
      </div>
      <div className="flex flex-col">
        <Button
          href="/lobby"
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
          prefetch={false}
          className="item-center my-4 flex w-full justify-center !bg-stone-800 py-2 font-mono !text-xl uppercase hover:!bg-stone-500"
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
