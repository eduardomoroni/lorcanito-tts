"use client";

import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { useFirestore, useFirestoreDocData } from "reactfire";
import type { Game } from "@lorcanito/engine";
import { useNotification } from "~/client/providers/NotificationProvider";
import { useYesOrNoModal } from "~/client/providers/YesOrNoModalProvider";
import { doc, DocumentReference } from "firebase/firestore";
import {
  type Dependencies,
  createMockGame,
  noOpDeps,
  diffLogger,
  MobXRootStore,
} from "@lorcanito/engine";

type ContextType = {
  playerId: string;
  rootStore: MobXRootStore;
};
import { Firestore } from "firebase/firestore";
import { debounce } from "~/libs/debounce";

const DEBOUNCE_WAIT = 1000;

function storeSync(rootStore: MobXRootStore, data: Game) {
  const prevState = rootStore.toJSON();
  const nextState = rootStore.sync(data).toJSON();
  console.log("firebase sync");
  diffLogger(prevState, nextState, console, false);
}

const debouncedStoreSync = debounce(storeSync, DEBOUNCE_WAIT);

export const useFirebaseSync = (
  rootStore: MobXRootStore,
  firestore: Firestore,
  data: Game,
) => {
  useEffect(() => {
    if (data.winner) {
      console.log("winner", data.winner);
      return;
    }

    debouncedStoreSync(rootStore, data);
  }, [rootStore, data]);
};

const Context = createContext<ContextType>({
  playerId: "",
  rootStore: new MobXRootStore(createMockGame(), noOpDeps, false),
});

export const GameStoreProvider: FC<{
  gameId: string;
  playerId: string;
  ssrGame: Game;
  children: ReactNode;
}> = ({ gameId, playerId, children, ssrGame }) => {
  const firestore = useFirestore();

  const logger = { log: console.log };
  const notifier = useNotification();
  const { openYesOrNoModal } = useYesOrNoModal();

  const args: Dependencies = {
    logger,
    notifier: notifier,
    modals: {
      openYesOrNoModal: openYesOrNoModal,
      openTargetModal: () => {
        /* There's a cyclic dependency */
      },
      openScryModal: () => {
        /* There's a cyclic dependency */
      },
    },
    playerId,
  };

  const gameRef = doc(firestore, "games", gameId) as DocumentReference<Game>;
  const { data } = useFirestoreDocData<Game>(gameRef, {
    initialData: ssrGame,
  });
  // TODO: THIS can make things out of sync
  const [store] = useState(() => {
    return new MobXRootStore(ssrGame, args, true);
  });
  store.setUndoState("");
  useFirebaseSync(store, firestore, data);

  return (
    <Context.Provider
      value={{
        playerId,
        rootStore: store,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export function useGameStore() {
  const { rootStore } = useContext(Context);

  return rootStore;
}
