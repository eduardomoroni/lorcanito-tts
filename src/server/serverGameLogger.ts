import { StreamChat } from "stream-chat";
import { adminDatabase } from "~/libs/3rd-party/firebase/admin";
import { type InternalLogEntry, type LogEntry } from "@lorcanito/engine";
import { createLogEntry } from "@lorcanito/engine";
import * as Sentry from "@sentry/nextjs";

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

export function getGameChatChannel(gameId: string) {
  const serverClient = getStreamServerClient();

  return serverClient.channel("messaging", gameId, {
    name: "Lorcanito Game: " + gameId,
  });
}

// TODO: This might be causing additional requests to the database
export async function updateStreamUser(userId: string) {
  const userName = (await adminDatabase.ref(`users/${userId}`).get()).val();
  const serverClient = getStreamServerClient();
  await serverClient.upsertUser({
    id: userId,
    username: userName,
    role: "admin",
  });
}

export async function updateStreamGameChat(userId: string, gameId: string) {
  await updateStreamUser(userId);

  const serverClient = getStreamServerClient();
  const channel = serverClient.channel("messaging", gameId, {
    created_by_id: userId,
  });
  await channel.create();
  await channel.addMembers([userId]);
}

export async function removeStreamGameChat(userId: string, gameId: string) {
  const channel = await getGameChatChannel(gameId);
  await channel.removeMembers([userId]);
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
  logEntry: InternalLogEntry | InternalLogEntry[],
  gameId: string,
  pushNotification: boolean = false,
) {
  // TODO: Doing this on a loop can delay the response of the request
  const gameChatChannel = getGameChatChannel(gameId);

  await gameChatChannel.sendMessage(
    {
      user: systemUser,
      silent: !pushNotification,
      logEntry: logEntry,
    },
    { skip_push: !pushNotification },
  );
}

async function pushLogToFirebaseServer(
  logEntry: InternalLogEntry,
  gameId: string,
) {
  const logReference = adminDatabase.ref(`logs/${gameId}/`);
  await logReference.push(logEntry);
}

export async function sendLog(
  gameId: string,
  entry: LogEntry | LogEntry[],
  sender = "SYSTEM",
  pushNotification: boolean = false,
) {
  const logEntry = Array.isArray(entry)
    ? entry.map((item) => createLogEntry(item, sender))
    : createLogEntry(entry, sender);

  try {
    await Promise.all([
      // pushLogToFirebaseServer(logEntry, gameId),
      pushLogToStreamServer(logEntry, gameId, pushNotification),
    ]);
  } catch (e) {
    Sentry.captureException(e);
    console.error(e);
  }
}
