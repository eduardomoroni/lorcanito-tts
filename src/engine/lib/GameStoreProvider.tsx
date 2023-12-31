"use client";

import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import { useDatabase, useFirestore, useFirestoreDocData } from "reactfire";
import { useGameLogger } from "~/spaces/Log/game-log/GameLogProvider";
import type { Game } from "~/libs/game";
import { useNotification } from "~/spaces/providers/NotificationProvider";
import { AdditionalArgs } from "~/engine/engine";
import { useYesOrNoModal } from "~/spaces/providers/YesOrNoModalProvider";
import { MobXRootStore } from "~/engine/store/RootStore";
import { useFirebaseSync } from "~/engine/lib/useFirebaseSync";
import { doc, DocumentReference } from "firebase/firestore";

type ContextType = {
  playerId: string;
  rootStore: MobXRootStore;
};

const Context = createContext<ContextType>({
  playerId: "",
  rootStore: {} as MobXRootStore,
});

export const GameStoreProvider: FC<{
  gameId: string;
  playerId: string;
  ssrGame: Game;
  children: ReactNode;
}> = ({ gameId, playerId, children, ssrGame }) => {
  const database = useDatabase();
  const firestore = useFirestore();

  const logger = useGameLogger();
  const notifier = useNotification();
  const openModal = useYesOrNoModal();

  const args: AdditionalArgs = {
    logger,
    notifier: notifier,
    modals: {
      openYesOrNoModal: openModal,
      openTargetModal: () => {
        /* There's a cyclic dependency */
      },
      openScryModal: () => {
        /* There's a cyclic dependency */
      },
    },
    playerId,
  };

  // const { data } = useDatabaseObjectData<Game>(
  //   ref(database, `games/${gameId}`),
  //   {
  //     initialData: ssrGame,
  //   },
  // );
  const gameRef = doc(firestore, "games", gameId) as DocumentReference<Game>;
  const { data } = useFirestoreDocData<Game>(gameRef, {
    initialData: ssrGame,
  });
  // TODO: THIS can make things out of sync
  const store = useMemo(() => {
    return new MobXRootStore(data || ssrGame, args, true);
  }, []);

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
