import admin, {
  adminDatabase,
  adminFirestore,
} from "~/libs/3rd-party/firebase/admin";
import { createId } from "@paralleldrive/cuid2";
import {
  createEmptyGame,
  createEmptyGameLobby,
  type Game,
  type GameLobby,
} from "@lorcanito/engine";
import { generateLobbyName } from "~/libs/name-generator/generator";
import type { MobXRootStore } from "@lorcanito/engine";
import { firestore } from "firebase-admin";
import { recursivelyNullifyUndefinedValues } from "~/libs/3rd-party/firebase/database/utils";
import { Random } from "~/libs/random";
import { sendLog } from "~/server/serverGameLogger";
import FirestoreDataConverter = firestore.FirestoreDataConverter;
import * as Sentry from "@sentry/nextjs";

export async function createGame(key: string, gameInput?: Game): Promise<Game> {
  const gameRef = adminFirestore.doc(`games/${key}`);

  const lastActivity = admin.database.ServerValue.TIMESTAMP;

  if (gameInput) {
    gameInput.lastActivity = lastActivity as number;
    gameInput.id = key;
  }

  const game = gameInput || createEmptyGame(key, Random.seed(), lastActivity);
  await gameRef.set(game);

  return game;
}

export async function getGame(gameId: string): Promise<Game | null> {
  const gameRef = adminFirestore.doc(`games/${gameId}`);
  const docSnap = await gameRef.get();

  if (docSnap.exists) {
    return docSnap.data() as Game;
  } else {
    return null;
  }
}

export async function getGameStore(
  gameId: string,
  converter: FirestoreDataConverter<MobXRootStore>,
): Promise<MobXRootStore | undefined> {
  const docSnap = await adminFirestore
    .doc(`games/${gameId}`)
    .withConverter(converter)
    .get();

  return docSnap.data();
}

export async function sendTRPCGame(store: MobXRootStore, undoState?: string) {
  const game = store.toJSON();
  const moveResult = store.flushResponse();

  if (!moveResult) {
    throw new Error("No move result");
  }

  if (!moveResult.success) {
    throw new Error("Move result was not successful");
  }

  if (undoState) {
    game.undoState = undoState;
  }

  // @ts-ignore
  game.lastActivity = admin.firestore.FieldValue.serverTimestamp();
  const updateGamePromise = adminFirestore
    .doc(`games/${game.id}`)
    .update(recursivelyNullifyUndefinedValues<Game>(game));

  if (moveResult.logs) {
    for (const log of moveResult.logs) {
      try {
        // TODO: change to sending an array of logs
        await sendLog(game.id, log, store.activePlayer);
      } catch (e) {
        Sentry.captureException(e);
        console.error(e);
      }
    }
    // try {
    //   // TODO: change to sending an array of logs
    //   await sendLog(game.id, moveResult.logs, store.activePlayer);
    // } catch (e) {
    //   console.error(e);
    // }
  }

  await updateGamePromise;

  return game;
}

export async function getOrCreateGame(gameId: string): Promise<Game> {
  const game = await getGame(gameId);

  if (game) {
    return game;
  } else {
    return createGame(gameId);
  }
}

export async function createGameLobby(
  userId: string,
  lobbyId?: string,
): Promise<GameLobby> {
  const key = lobbyId || createId();
  const lobbyRef = adminDatabase.ref(`lobbies/${key}`);
  const game = await createGame(key);

  const lastActivity = admin.database.ServerValue.TIMESTAMP;
  const lobby = createEmptyGameLobby(
    key,
    game.id,
    userId,
    generateLobbyName(),
    lastActivity as string,
  );
  await lobbyRef.set(lobby);

  return lobby;
}

export async function purgeGames() {
  const removed: string[] = [];

  await adminDatabase
    .ref("lobbies")
    .transaction(
      (lobbies: Record<string, GameLobby>): Record<string, GameLobby> => {
        if (!lobbies) {
          return lobbies;
        }

        Object.values(lobbies).forEach((lobby) => {
          if (
            !lobby.lastActivity ||
            areDatesDaysApart(1, lobby.lastActivity as unknown as number)
          ) {
            removed.push(lobby.id);
            delete lobbies[lobby.id];
          }
        });

        return lobbies;
      },
    );

  const updates: Record<string, unknown> = {};
  removed.forEach((id) => {
    updates[id] = null;
  });
  await adminDatabase.ref(`presence/lobbies`).update(updates);
  await adminDatabase.ref(`games`).update(updates);
  await adminDatabase.ref(`logs`).update(updates);
  const batch = adminFirestore.batch();
  removed.forEach((id) => {
    batch.delete(adminFirestore.doc(`games/${id}`));
  });
  // const query = await adminFirestore
  //   .collection("games")
  //   .where("lastActivity", "<", Date.now() - oneDayInMilli)
  //   .get();
  //
  // query.forEach((doc) => {
  //   console.log(doc.id);
  //   batch.delete(adminFirestore.doc(`games/${doc.id}`));
  // });

  await batch.commit();

  return removed.filter(Boolean);
}

function areDatesDaysApart(
  days: number,
  prevString: number,
  later = new Date(),
) {
  try {
    const prev = new Date(parseInt(prevString as unknown as string));
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    // @ts-ignore
    const differenceInMilliseconds = Math.abs(prev - later);
    const differenceInDays = differenceInMilliseconds / oneDayInMilliseconds;

    return differenceInDays > days;
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return true;
  }
}
