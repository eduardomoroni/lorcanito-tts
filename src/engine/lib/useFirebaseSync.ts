import { Game } from "~/libs/game";
import { useEffect } from "react";
import { autorun } from "mobx";
import { convertDiffToRealTimeUpdates, getDiff } from "~/engine/lib/stateDiff";
import { Firestore, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { MobXRootStore } from "~/engine/store/RootStore";
import { Dependencies } from "~/engine/store/types";

export const useFirebaseSync = (
  rootStore: MobXRootStore,
  firestore: Firestore,
  data: Game,
) => {
  useEffect(() => {
    const storeState = rootStore.toJSON();
    const firebaseState = new MobXRootStore(
      data,
      {} as Dependencies,
      false,
    ).toJSON();

    const diff = getDiff(storeState, firebaseState);

    if (
      // We have a problem that firebase removes empty arrays
      diff?.filter((d) => !(Array.isArray(d.lhs) && d.lhs.length === 0))
        .length > 0
    ) {
      console.groupCollapsed("[SYNC] Store");
      console.log({ storeState, firebaseState, diff });

      rootStore.sync(firebaseState);

      console.log("update", rootStore.toJSON());
      console.groupEnd();
    }
  }, [data]);

  useEffect(() => {
    let prevState = rootStore.toJSON();

    return autorun(() => {
      try {
        const nextState: Game = rootStore.toJSON();
        const difference = getDiff(prevState, nextState);

        // If we have just synced, we don't have to update firebase with the same data;
        if (!difference || difference.length === 0) {
          console.log("Skipping firebase sync, no changes");
          prevState = nextState;
          return;
        }

        if (difference && prevState) {
          const updates = convertDiffToRealTimeUpdates(difference, nextState);

          recursivelyNullifyUndefinedValues(updates);

          if (updates) {
            console.groupCollapsed(`[SYNC] Firebase: ${prevState.id}`);
            console.log({ prevState, nextState, diff: difference });

            // if (database) {
            //   update(ref(database, `games/${prevState.id}`), updates).catch(
            //     console.error,
            //   );
            //   console.log("Realtime DB", updates);
            // }

            if (firestore) {
              const gameReference = doc(firestore, "games", prevState.id);
              getDoc(gameReference).then((doc) => {
                if (doc.exists()) {
                  updateDoc(gameReference, nextState);
                } else {
                  setDoc(gameReference, nextState);
                }
              });
            }

            console.groupEnd();
          }
        }

        prevState = nextState;
      } catch (e) {
        console.error(e);
      }
    });
  }, [rootStore, data]);
};

function recursivelyNullifyUndefinedValues(obj: unknown = {}) {
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (!!value && typeof value === "object") {
      recursivelyNullifyUndefinedValues(value);
    } else if (value === undefined) {
      // @ts-ignore
      obj[key] = null;
    }
  });
  return obj;
}
