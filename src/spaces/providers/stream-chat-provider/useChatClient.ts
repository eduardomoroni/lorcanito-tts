import { useEffect, useState } from "react";
import { StreamChat, type TokenOrProvider, type User } from "stream-chat";

export type UseClientOptions = {
  user: User;
  tokenOrProvider: TokenOrProvider;
};

export const useClient = ({
  user,
  tokenOrProvider,
}: UseClientOptions): StreamChat | undefined => {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

  const [chatClient, setChatClient] = useState<StreamChat>();

  useEffect(() => {
    if (!apiKey || !tokenOrProvider || !user?.id) {
      return;
    }

    const client = new StreamChat(apiKey);
    // prevents application from setting stale client (user changed, for example)
    let didUserConnectInterrupt = false;

    const connectionPromise = client
      .connectUser(user, tokenOrProvider)
      .then(() => {
        if (!didUserConnectInterrupt) {
          console.log("connection started");
          setChatClient(client);
        }
      });

    return () => {
      didUserConnectInterrupt = true;
      setChatClient(undefined);
      // wait for connection to finish before initiating closing sequence
      connectionPromise
        .then(() => client.disconnectUser())
        .then(() => {
          console.log("connection closed");
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- should re-run only if user.id changes
  }, [apiKey, user?.id, tokenOrProvider]);

  return chatClient;
};
