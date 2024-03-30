import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useGameStore } from "~/client/providers/GameStoreProvider";
import { ScryEffect } from "@lorcanito/engine";
import type { ResolvingParam } from "@lorcanito/engine";
export type ScryModalParams = Omit<ScryEffect, "type" | "target"> & {
  title?: string;
  subtitle?: string;
  callback?: (param?: ResolvingParam["scry"]) => void;
};

export const ScryModalContext = createContext<{
  // TODO: THIS TYPING IF BAD, it breaks encapsulation
  openScryModal: (args: ScryModalParams) => void;
  closeScryModal: () => void;
  params?: ScryModalParams;
}>({ openScryModal: () => {}, closeScryModal: () => {} });

export function ScryModalProvider({ children }: { children: JSX.Element }) {
  const mobXRootStore = useGameStore();
  const [params, setParams] = useState<ScryModalParams | undefined>(undefined);

  useEffect(() => {
    //TODO: THIS IS HACKY, I NEED TO FIX THIS
    mobXRootStore.dependencies.modals.openScryModal = setParams;
  }, []);

  const closeScryModal = useCallback(() => {
    setParams(undefined);
  }, [setParams]);

  return (
    <ScryModalContext.Provider
      value={{
        openScryModal: (params: ScryModalParams | undefined) => {
          setParams(params);
        },
        closeScryModal,
        params: params,
      }}
    >
      {children}
    </ScryModalContext.Provider>
  );
}

export function useScryModal() {
  return useContext(ScryModalContext);
}
