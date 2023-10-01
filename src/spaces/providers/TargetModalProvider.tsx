import React, { createContext, useContext, useEffect, useState } from "react";
import type { TargetFilter } from "~/spaces/components/modals/target/filters";
import { TargetModal } from "~/spaces/components/modals/target/TargetModal";
import type { CardModel } from "~/engine/store/models/CardModel";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { Ability } from "~/engine/rules/abilities/abilities";

export type OpenTargetModalParams = {
  title?: string;
  subtitle?: string;
  filters: TargetFilter[];
  callback: (target?: CardModel) => void;
  onCancel?: () => void;
  type?: "challenge" | Ability["type"] | "";
};
const TargetModalContext = createContext<{
  openTargetModal: (args: OpenTargetModalParams) => void;
}>({
  openTargetModal: () => {},
});

export function TargetModalProvider({ children }: { children: JSX.Element }) {
  const store = useGameStore();
  const [activeFilter, setActiveFilter] = useState<OpenTargetModalParams>({
    filters: [],
    callback: () => {},
    onCancel: () => {},
    type: "",
    title: "",
    subtitle: "",
  });

  const onClose = () => {
    setActiveFilter({
      filters: [],
      callback: () => {},
      onCancel: () => {},
      type: "",
      title: "",
      subtitle: "",
    });
  };

  useEffect(() => {
    //TODO: THIS IS HACKY, I NEED TO FIX THIS
    store.dependencies.modals.openTargetModal = setActiveFilter;
  }, []);

  return (
    <TargetModalContext.Provider
      value={{
        openTargetModal: setActiveFilter,
      }}
    >
      {children}
      {activeFilter.filters?.length > 0 ? (
        <TargetModal
          title={activeFilter.title}
          subtitle={activeFilter.subtitle}
          type={activeFilter.type || ""}
          activeFilters={activeFilter.filters}
          onClose={() => {
            onClose();
          }}
          onCancel={() => {
            if (activeFilter.onCancel) {
              activeFilter.onCancel();
            }

            onClose();
          }}
          onTargetChosen={activeFilter.callback}
        />
      ) : null}
    </TargetModalContext.Provider>
  );
}

export function useTargetModal() {
  return useContext(TargetModalContext);
}
