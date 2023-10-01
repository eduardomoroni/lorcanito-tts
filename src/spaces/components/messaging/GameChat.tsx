import React from "react";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  useMessageContext,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import "./game-chat.css";
import { Log } from "~/spaces/Log/LogEntry";
import { useStreamChat } from "~/spaces/providers/stream-chat-provider/StreamChatProvider";
import type { InternalLogEntry } from "~/spaces/Log/types";
import { useFirebaseUserId } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";

const CustomHeader = () => {
  return (
    <h2 className="ml-2 text-lg font-medium text-gray-200 md:flex-shrink-0">
      Chat & Log
    </h2>
  );
};

const GameChat: React.FC<{ isLogEnabled?: boolean }> = ({
  theme = "str-chat__theme-dark",
  isLogEnabled = true,
}: {
  theme?: "str-chat__theme-dark" | "str-chat__theme-light";
  isLogEnabled?: boolean;
}) => {
  // return null;
  const { client, channel, isEnabled } = useStreamChat();

  if (!client || !channel) {
    return null;
  }

  const CustomMessage = () => {
    const { message } = useMessageContext();
    const userId = useFirebaseUserId();

    if ("logEntry" in message) {
      if (isLogEnabled) {
        return (
          <Log entry={message.logEntry as InternalLogEntry} key={message.id} />
        );
      } else {
        return null;
      }
    }

    // TODO: usePlayerNickname hook
    return (
      <div className="font-mono" key={message.id}>
        <b
          className={
            userId === message?.user?.id ? "text-emerald" : "text-amber"
          }
        >{`${message.user?.username || message.user?.name}: `}</b>{" "}
        {message.text}
      </div>
    );
  };

  return (
    <Chat client={client} theme={theme}>
      <Channel channel={channel}>
        <Window>
          <CustomHeader />
          <MessageList Message={CustomMessage} />
          {isEnabled ? (
            <MessageInput noFiles closeEmojiPickerOnClick disableMentions />
          ) : null}
        </Window>
      </Channel>
    </Chat>
  );
};

export default GameChat;
