import { MobXRootStore } from "@lorcanito/engine";
import type { Dependencies } from "@lorcanito/engine";
import type firebase from "firebase/compat";
import type { Game } from "@lorcanito/engine";
import { firestore } from "firebase-admin";

export function createConverter(
  dependencies: Dependencies,
  observable = false,
): firestore.FirestoreDataConverter<MobXRootStore> {
  if (!dependencies.playerId) {
    throw new Error("Missing playerId in dependencies");
  }

  return {
    toFirestore(store: MobXRootStore): firebase.firestore.DocumentData {
      return store.toJSON();
    },
    // @ts-expect-error
    fromFirestore(
      snapshot: firebase.firestore.QueryDocumentSnapshot,
      options: firebase.firestore.SnapshotOptions,
    ) {
      const data = snapshot.data(options)! as Game;
      return new MobXRootStore(data, dependencies, observable);
    },
  };
}
