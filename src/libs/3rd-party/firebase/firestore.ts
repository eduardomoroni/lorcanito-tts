import { adminFirestore } from "~/libs/3rd-party/firebase/admin";
import type { Game } from "@lorcanito/engine";

export async function getFirestoreGame(gameId: string) {
  const gameReference = adminFirestore.doc(`games/${gameId}`);
  const gameSnapshot = await gameReference.get();

  if (!gameSnapshot.exists) {
    throw new Error("Game not found.");
  }

  return gameSnapshot.data() as Game;
}
