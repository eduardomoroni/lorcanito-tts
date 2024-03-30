import React from "react";
import {
  Channel,
  Chat,
  MessageInput,
  useMessageContext,
  VirtualizedMessageList,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import "./game-chat.css";
import { Log } from "~/client/Log/game-log/LogEntry";
import { useStreamGameChat } from "~/client/providers/stream-chat-provider/StreamChatProvider";
import type { InternalLogEntry } from "@lorcanito/engine";
import { useFirebaseUserId } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";

const CustomHeader = () => {
  return (
    <h2 className="ml-2 text-lg font-medium text-gray-200 md:flex-shrink-0">
      Chat & Logs
    </h2>
  );
};

function isLogEntry(data: unknown): data is InternalLogEntry {
  if (!data || typeof data !== "object") {
    return false;
  }

  return "id" in data && "type" in data;
}

const GameChat: React.FC<{ isLogEnabled?: boolean }> = ({
  theme = "str-chat__theme-dark",
  isLogEnabled = true,
}: {
  theme?: "str-chat__theme-dark" | "str-chat__theme-light";
  isLogEnabled?: boolean;
}) => {
  const { client, channel, isEnabled } = useStreamGameChat();

  if (!client || !channel) {
    return null;
  }

  const CustomMessage = () => {
    const { message } = useMessageContext();
    const userId = useFirebaseUserId();
    if ("logEntry" in message) {
      if (isLogEnabled) {
        const logEntry = message.logEntry;

        if (isLogEntry(logEntry)) {
          return <Log entry={logEntry} />;
        }

        if (Array.isArray(logEntry)) {
          return (
            <>
              {logEntry.filter(isLogEntry).map((entry, index) => {
                return <Log entry={entry} key={index + entry.id} />;
              })}
            </>
          );
        }

        return null;
      } else {
        return null;
      }
    }

    // TODO: usePlayerNickname hook
    return (
      <div className="font-mono">
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
      <Channel channel={channel} VirtualMessage={CustomMessage}>
        <Window>
          <CustomHeader />
          <VirtualizedMessageList hideDeletedMessages />
          {isEnabled ? (
            <MessageInput
              disableMentions
              noFiles
              closeEmojiPickerOnClick
              grow
              publishTypingEvent
            />
          ) : null}
        </Window>
      </Channel>
    </Chat>
  );
};

export default GameChat;
