import React, { createContext, useContext, useEffect, useState } from "react";
import type { TargetFilter } from "@lorcanito/engine";
import { TargetModal } from "~/client/components/modals/target/TargetModal";
import type { CardModel } from "@lorcanito/engine";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import type { Ability } from "@lorcanito/engine";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";

export type OpenTargetModalParams = {
  title?: string;
  subtitle?: string;
  filters: TargetFilter[];
  callback: (targets: CardModel[]) => void;
  onCancel?: () => void;
  mandatory?: boolean;
  type?: "challenge" | "sing" | Ability["type"] | "";
  responder?: string;
  source?: CardModel;
  amount?: number;
};

const TargetModalContext = createContext<{
  openTargetModal: (args: OpenTargetModalParams) => void;
  closeTargetModal: () => void;
}>({
  openTargetModal: () => {},
  closeTargetModal: () => {},
});

export function TargetModalProvider({ children }: { children: JSX.Element }) {
  const store = useGameStore();
  const [activeFilter, setActiveFilter] = useState<
    OpenTargetModalParams | undefined
  >(undefined);

  const closeTargetModal = () => {
    setActiveFilter(undefined);
  };

  useEffect(() => {
    //TODO: THIS IS HACKY, I NEED TO FIX THIS
    store.dependencies.modals.openTargetModal = setActiveFilter;
  }, []);

  return (
    <TargetModalContext.Provider
      value={{
        openTargetModal: setActiveFilter,
        closeTargetModal,
      }}
    >
      {children}
      {activeFilter ? (
        <TargetModal
          title={
            activeFilter.source ? (
              <ModalTitle card={activeFilter.source} type={activeFilter.type} />
            ) : (
              activeFilter.title
            )
          }
          subtitle={activeFilter.subtitle}
          responder={activeFilter.responder}
          type={activeFilter.type || ""}
          activeFilters={activeFilter.filters}
          source={activeFilter.source}
          mandatory={activeFilter.mandatory}
          onClose={() => {
            closeTargetModal();
          }}
          onCancel={() => {
            if (activeFilter.onCancel) {
              activeFilter.onCancel();
            }

            closeTargetModal();
          }}
          onTargetChosen={activeFilter.callback}
          amount={activeFilter.amount}
        />
      ) : null}
    </TargetModalContext.Provider>
  );
}

function ModalTitle(props: {
  card?: CardModel;
  type?: "sing" | "challenge" | Ability["type"] | "";
}) {
  if (!props.card) {
    return null;
  }

  const { card, type } = props;
  const setCardPreview = useSetCardPreview();
  let element = <span>Chose target for </span>;

  if (type === "challenge") {
    element = <span>Choose a glimmer to challenge with </span>;
  } else if (type === "sing") {
    element = <span>Choose a singer for </span>;
  }

  return (
    <>
      {element}
      <span
        onMouseEnter={() => setCardPreview({ card: card.lorcanitoCard })}
        onMouseLeave={() => setCardPreview(undefined)}
        className={`bold cursor-pointer underline text-${card.color}`}
      >
        {card.fullName}
      </span>
    </>
  );
}

export function useTargetModal() {
  return useContext(TargetModalContext);
}
