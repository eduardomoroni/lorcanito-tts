// https://firebase.google.com/docs/database/web/offline-capabilities#web-version-9
import {
  getDatabase,
  onDisconnect,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import { GameLobby } from "~/libs/game";
import type { User } from "@firebase/auth";
import * as Sentry from "@sentry/nextjs";

export function setUpPlayerPresence(uid: string) {
  const db = getDatabase();

  // Since I can connect from multiple devices or browser tabs, we store each connection instance separately
  // any time that connectionsRef's value is null (i.e. has no children) I am offline
  return onValue(ref(db, ".info/connected"), (snap) => {
    if (snap.val() === true) {
      // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
      const con = push(ref(db, `presence/players/${uid}/connections`));

      // When I disconnect, remove this device
      onDisconnect(con).remove();

      // Add this device to my connections list
      // this value could contain info about the device or a timestamp too
      set(con, true);

      // When I disconnect, update the last time I was seen online
      onDisconnect(ref(db, `presence/players/${uid}/lastOnline`)).set(
        serverTimestamp(),
      );
    }
  });
}

export type LobbyPresence = {
  owner?: string;
  createdAt?: number | string;
  name: string;
  id: string;
  lastUpdated?: number;
  full: boolean;
};

export function removeLobbyPresence(gameId: string) {
  try {
    const db = getDatabase();
    const reference = ref(db, `presence/lobbies/${gameId}`);
    set(reference, null);
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
  }
}

export function setUpLobbyPresence(
  gameLobby: GameLobby,
  firebaseUser: User | null,
) {
  const db = getDatabase();

  if (firebaseUser?.uid !== gameLobby.ownerId) {
    return () => {};
  }

  // Since I can connect from multiple devices or browser tabs, we store each connection instance separately
  // any time that connectionsRef's value is null (i.e. has no children) I am offline
  return onValue(ref(db, ".info/connected"), (snap) => {
    if (snap.val() === true) {
      // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
      const userName = firebaseUser?.displayName || firebaseUser?.uid;
      const reference = ref(db, `presence/lobbies/${gameLobby.gameId}`);
      const lobbyPresence: LobbyPresence = {
        owner: userName,
        createdAt: gameLobby.lastActivity || Date.now(),
        name: gameLobby.name,
        id: gameLobby.gameId,
        full: Object.keys(gameLobby.players || {}).length > 1,
        lastUpdated: serverTimestamp() as unknown as number,
      };
      set(reference, lobbyPresence);
      onDisconnect(reference).set(null);
    }
  });
}
