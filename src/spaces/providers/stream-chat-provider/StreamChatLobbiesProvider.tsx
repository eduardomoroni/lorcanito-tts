import React, { useEffect, useState } from "react";
import { useFirebaseUser } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { api } from "~/libs/api";
import { useClient } from "~/spaces/providers/stream-chat-provider/useChatClient";
import type {
  StreamChat,
  Channel as StreamChannel,
  UserResponse,
} from "stream-chat";

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

export const StreamChatLobbiesProvider: React.FC<{
  children: React.ReactNode;
  streamToken: string;
}> = ({ children, streamToken }) => {
  const firebaseUser = useFirebaseUser();

  const userId = firebaseUser?.uid || "";
  const userName = firebaseUser?.displayName || userId;
  const user = {
    id: firebaseUser?.uid || "",
    name: userName.substring(0, 10),
    userName: firebaseUser?.displayName,
    image: `https://getstream.io/random_png/?id=${userId}&name=${userName}`,
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
    tokenOrProvider: token || streamToken,
  });

  const [channel, setChannel] = useState<StreamChannel>();
  useEffect(() => {
    if (!chatClient) return;

    const date = new Date();
    const chatId = `lorcanito-pages-lobby`;
    const gameChannel = chatClient.channel("livestream", chatId, {
      name: `Lorcanito Lobby`,
    });

    setChannel(gameChannel);
  }, [chatClient, userName]);

  return (
    <Context.Provider
      value={{
        client: chatClient,
        channel: channel,
        streamUser: user,
        isEnabled: !!userName,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStreamChat = () => React.useContext(Context);
