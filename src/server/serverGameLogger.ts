import { StreamChat } from "stream-chat";
import { createLogEntry } from "~/spaces/Log/game-log/GameLogProvider";
import { adminDatabase } from "~/3rd-party/firebase/admin";
import {
  type InternalLogEntry,
  type LogEntry,
} from "~/spaces/Log/game-log/types";

const api_key = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

const systemUser = {
  id: "system",
  name: "system",
  userName: "system",
  image: `https://getstream.io/random_png/?id=system&name=system`,
};

export function getStreamServerClient() {
  return StreamChat.getInstance(api_key || "", api_secret);
}

export async function getGameChatChannel(gameId: string) {
  const serverClient = await getStreamServerClient();

  return serverClient.channel("messaging", gameId, {
    image: "https://goo.gl/Zefkbx",
    name: "Lorcanito Game",
  });
}

export async function updateStreamUser(userId: string, gameId: string) {
  const userName = (await adminDatabase.ref(`users/${userId}`).get()).val();
  const serverClient = await getStreamServerClient();
  await serverClient.upsertUser({
    id: userId,
    username: userName,
    role: "admin",
  });

  const channel = serverClient.channel("messaging", gameId);
  await channel.create();
  await channel.addMembers([userId]);
}

export async function deleteChannelMessages(gameId: string) {
  const channel = await getGameChatChannel(gameId);
  await channel.truncate({
    hard_delete: true,
    skip_push: true,
    message: {
      text: "Game restarted.",
      user_id: systemUser.id,
    },
  });
}

async function pushLogToStreamServer(
  logEntry: InternalLogEntry,
  gameId: string
) {
  const gameChatChannel = await getGameChatChannel(gameId);

  await gameChatChannel.sendMessage(
    {
      user: systemUser,
      silent: true,
      logEntry: logEntry,
    },
    { skip_push: true }
  );
}

async function pushLogToFirebaseServer(
  logEntry: InternalLogEntry,
  gameId: string
) {
  const logReference = adminDatabase.ref(`logs/${gameId}/`);
  await logReference.push(logEntry);
}

export async function sendLog(
  gameId: string,
  entry: LogEntry,
  sender = "SYSTEM"
) {
  const logEntry = createLogEntry(entry, sender);

  await Promise.all([
    pushLogToFirebaseServer(logEntry, gameId),
    pushLogToStreamServer(logEntry, gameId),
  ]);
}
