import React, { useEffect, useState } from "react";
import { useFirebaseUser } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { api } from "~/libs/api";
import { useClient } from "~/client/providers/stream-chat-provider/useChatClient";
import type {
  Channel as StreamChannel,
  StreamChat,
  UserResponse,
} from "stream-chat";
import { SingletonChat } from "~/client/providers/stream-chat-provider/SingletonChat";
import { generateUserName } from "~/libs/name-generator/generator";
import { updateNickName } from "~/libs/3rd-party/firebase/nickName";
import { useDatabase } from "reactfire";

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

const fallbackNickName = generateUserName();

export const StreamChatProvider: React.FC<{
  children: React.ReactNode;
  chatId: string;
  chatName?: string;
  playerId: string;
  streamToken: string;
  players: string[];
  channelType?: string;
}> = ({
  channelType = "messaging",
  chatName,
  children,
  chatId,
  streamToken,
  playerId,
  players,
}) => {
  const firebaseUser = useFirebaseUser();
  const enabled =
    channelType === "livestream" ? true : players.includes(playerId);
  const database = useDatabase();

  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

    if (!firebaseUser.displayName) {
      updateNickName(database, firebaseUser);
    }
  }, [firebaseUser?.displayName]);

  const nickName = firebaseUser?.displayName || fallbackNickName;

  const user = {
    id: firebaseUser?.uid || "",
    name: nickName,
    userName: nickName,
    image: `https://getstream.io/random_png/?id=${playerId}&name=${nickName}`,
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

    const gameChannel =
      channelType === "livestream"
        ? chatClient.channel("livestream", chatId, {
            name: chatName || chatId,
          })
        : chatClient.channel(channelType, chatId, {
            name: chatName || chatId,
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

export const useStreamGameChat = () => React.useContext(Context);
