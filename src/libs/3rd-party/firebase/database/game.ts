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
} from "~/libs/game";
import { generateName } from "~/libs/name-generator/generator";

export async function createGame(key: string): Promise<Game> {
  // const gameRef = adminDatabase.ref(`games/${key}`);
  const gameRef = adminFirestore.doc(`games/${key}`);

  const lastActivity = admin.database.ServerValue.TIMESTAMP;
  const game = createEmptyGame(key, lastActivity);
  await gameRef.set(game);

  return game;
}

export async function getOrCreateGame(gameId: string): Promise<Game> {
  // const gameRef = await adminDatabase.ref(`games/${gameId}`);
  // const dataSnapshot = await gameRef.get();
  const gameRef = adminFirestore.doc(`games/${gameId}`);
  const docSnap = await gameRef.get();

  if (docSnap.exists) {
    return docSnap.data() as Game;
  } else {
    return createGame(gameId);
  }
}

export async function createGameLobby(userId: string): Promise<GameLobby> {
  const key = createId();
  const lobbyRef = adminDatabase.ref(`lobbies/${key}`);
  const game = await createGame(key);

  const lastActivity = admin.database.ServerValue.TIMESTAMP;
  const lobby = createEmptyGameLobby(
    key,
    game.id,
    userId,
    generateName(),
    lastActivity as string,
  );
  await lobbyRef.set(lobby);

  return lobby;
}

export async function purgeGames() {
  const removed: string[] = [];
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
      console.error(error);
      return true;
    }
  }

  // TODO: Think about reducing the number of times we read the database
  await adminDatabase
    .ref("games")
    .transaction((games: Record<string, Game>): Record<string, Game> => {
      if (!games) {
        return games;
      }

      Object.values(games).forEach((game) => {
        if (!game.lastActivity || areDatesDaysApart(1, game.lastActivity)) {
          removed.push(game.id);
          delete games[game.id];
        }
      });

      return games;
    });

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

  // await adminDatabase.ref("logs").set(null);
  // await adminDatabase.ref("presence").set(null);

  return removed;
}
