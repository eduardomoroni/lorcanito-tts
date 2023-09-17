import React, { createContext, useContext, useEffect, useState } from "react";

import { ScryModal } from "~/components/modals/ScryModal";
import { useGameStore } from "~/engine/rule-engine/lib/GameStoreProvider";
import { ScryEffect } from "~/engine/effectTypes";
import type { ResolvingParam } from "~/store/StackLayerStore";
export type ScryModalParams = Omit<ScryEffect, "type" | "target"> & {
  callback?: (param?: ResolvingParam["scry"]) => void;
};

const Context = createContext<{
  // TODO: THIS TYPING IF BAD, it breaks encapsulation
  openScryModal: (args: ScryModalParams) => void;
}>({ openScryModal: () => {} });

export function ScryModalProvider({ children }: { children: JSX.Element }) {
  const mobXRootStore = useGameStore();
  const [params, setParams] = useState<ScryModalParams | undefined>(undefined);

  useEffect(() => {
    if (params?.amount) {
      mobXRootStore.log({
        type: "LOOKING_AT_TOP_CARDS",
        amount: params.amount,
      });
    }
  }, [params]);

  useEffect(() => {
    //TODO: THIS IS HACKY, I NEED TO FIX THIS
    mobXRootStore.dependencies.modals.openScryModal = setParams;
  }, []);

  return (
    <Context.Provider value={{ openScryModal: setParams }}>
      {children}
      {params && (
        <ScryModal
          open={!!params}
          scryCount={params.amount}
          mode={params.mode}
          limits={params.limits}
          onClose={() => {
            if (params.callback) {
              // TODO: This is lazy work, I need to fix this
              params?.callback({ top: [], bottom: [], hand: [] });
            }
            setParams(undefined);
          }}
        />
      )}
    </Context.Provider>
  );
}

export function useScryModal() {
  return useContext(Context).openScryModal;
}
