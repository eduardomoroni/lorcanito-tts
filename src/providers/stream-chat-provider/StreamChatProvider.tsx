import React, { useEffect, useState } from "react";
import { useFirebaseUser } from "~/3rd-party/firebase/FirebaseSessionProvider";
import { api } from "~/utils/api";
import { useClient } from "~/providers/stream-chat-provider/useChatClient";
import type {
  StreamChat,
  Channel as StreamChannel,
  UserResponse,
} from "stream-chat";
import { Message } from "stream-chat/src/types";

const Context = React.createContext<{
  client: StreamChat | undefined;
  channel: StreamChannel | undefined;
  streamUser: UserResponse | undefined;
  isEnabled: boolean;
}>({
  client: undefined,
  channel: undefined,
  streamUser: undefined,
  isEnabled: false,
});

// TODO: FIX THIS LATER
// THere's a problem where getStream channel take long to initialize, but we need the game engine ready as soon as possible.
// So we're using a singleton to send messages, but this is not ideal.
export class SingletonChat {
  static channel: StreamChannel | undefined;
  static user: UserResponse | undefined;

  static setChannel(channel: StreamChannel) {
    this.channel = channel;
  }

  static setUser(user: UserResponse) {
    this.user = user;
  }

  static async sendMessage(
    message: Message,
    options?: {
      force_moderation?: boolean;
      is_pending_message?: boolean;
      keep_channel_hidden?: boolean;
      pending?: boolean;
      pending_message_metadata?: Record<string, string>;
      skip_enrich_url?: boolean;
      skip_push?: boolean;
    },
  ) {
    if (!this.channel) {
      console.error("Channel not set");
      return;
    }

    message.user = this.user;
    await this.channel.sendMessage(message, options);
  }
}

export const StreamChatProvider: React.FC<{
  children: React.ReactNode;
  chatId: string;
  playerId: string;
  streamToken: string;
  players: string[];
}> = ({ children, chatId, streamToken, playerId, players }) => {
  const firebaseUser = useFirebaseUser();
  const enabled = players.includes(playerId);

  const user = {
    id: firebaseUser?.uid || "",
    name: (firebaseUser?.displayName || firebaseUser?.uid || "").substring(
      0,
      10,
    ),
    userName: firebaseUser?.displayName,
    image: `https://getstream.io/random_png/?id=${playerId}&name=${playerId}`,
  };
  const { data: token } = api.chat.getToken.useQuery(
    {},
    {
      cacheTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  // https://getstream.io/chat/docs/node/authless_users/?language=javascript
  const chatClient = useClient({
    user,
    tokenOrProvider: streamToken || token,
  });

  const [channel, setChannel] = useState<StreamChannel>();
  useEffect(() => {
    if (!chatClient) return;

    const gameChannel = chatClient.channel("messaging", chatId, {
      name: chatId,
      members: players,
      created_by: user,
    });

    setChannel(gameChannel);
    SingletonChat.setChannel(gameChannel);
    SingletonChat.setUser(user);
  }, [chatClient, enabled, players, chatId]);

  return (
    <Context.Provider
      value={{
        client: chatClient,
        channel: channel,
        streamUser: user,
        isEnabled: enabled,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStreamChat = () => React.useContext(Context);
