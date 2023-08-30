import React, { createContext, useContext, useState } from "react";

import { type TableCard } from "~/providers/TabletopProvider";

import { TargetFilter } from "~/components/modals/target/filters";
import { TargetModal } from "~/components/modals/target/TargetModal";

type OpenTargetModalParams = {
  title?: string;
  subtitle?: string;
  filters: TargetFilter[];
  callback: (target: TableCard) => void;
  onCancel?: () => void;
  type: "challenge" | "resolution" | "";
};
const TargetModalContext = createContext<{
  openTargetModal: (args: OpenTargetModalParams) => void;
}>({
  openTargetModal: () => {},
});

export function TargetModalProvider({ children }: { children: JSX.Element }) {
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
          type={activeFilter.type}
          activeFilters={activeFilter.filters}
          onClose={() => {
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
