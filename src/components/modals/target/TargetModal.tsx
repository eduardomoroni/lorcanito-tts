import React, { useEffect, useState } from "react";
import { MobileFilterDialog } from "~/components/modals/target/MobileFilter";
import { TargetModalHeader } from "~/components/modals/target/TargetModalHeader";
import { GenericModal } from "~/components/modals/generic/GenericModal";
import { type TargetFilter } from "~/components/modals/target/filters";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { CardImageOverlay } from "~/components/card/CardImageOverlay";
import { CardModel } from "~/store/models/CardModel";
import { observer } from "mobx-react-lite";
import {
  Ability,
  bodyguardAbilityPredicate,
} from "~/engine/rules/abilities/abilities";
import { CardIcons } from "~/components/card-icons/CardIcons";

function TargetModalComponent(props: {
  activeFilters: TargetFilter[];
  onClose: () => void;
  onCancel: () => void;
  onTargetChosen: (card?: CardModel) => void;
  type: "challenge" | Ability["type"] | "";
  title?: string;
  subtitle?: string;
}) {
  const {
    activeFilters,
    onClose,
    onCancel,
    onTargetChosen,
    type,
    title,
    subtitle,
  } = props;
  const [open, setOpen] = useState(false);
  const store = useGameStore();
  const filteredTableCards = store.cardStore.getCardsByFilter(activeFilters);
  const [selected, setSelected] = useState<CardModel | undefined>(undefined);

  useEffect(() => {
    if (selected) {
      onTargetChosen(selected);
      onClose();
    }
  }, [selected]);

  const bodyguardPresent =
    type === "challenge" &&
    filteredTableCards.some((card) => {
      const lorcanitoCard = card.lorcanitoCard;
      return lorcanitoCard?.abilities?.find(bodyguardAbilityPredicate);
    });

  function filterByOwner(card: CardModel) {
    const owner = card.ownerId;
    return owner === store.activePlayer;
  }

  const cardsYouOwn = filteredTableCards.filter(filterByOwner);
  const cardsYouDontOwn = filteredTableCards.filter(
    (card) => !filterByOwner(card),
  );

  const showSectionDescription =
    cardsYouOwn.length > 0 && cardsYouDontOwn.length > 0;

  return (
    <GenericModal
      title={title || "Choose a target"}
      subtitle={subtitle || ""}
      open={true}
      onCancel={onCancel}
      onConfirm={() => {
        if (selected) {
          onTargetChosen(selected);
        }

        onClose();
      }}
    >
      <div className="flex w-full flex-col">
        <MobileFilterDialog open={open} setOpen={setOpen} />
        <TargetModalHeader activeFilters={activeFilters} setOpen={setOpen} />
        <div className="h-[50vh] overflow-y-auto bg-gray-200">
          <div className="mx-auto max-w-2xl p-8 lg:max-w-7xl">
            {filteredTableCards.length === 0 && (
              <div className="relative mx-auto my-auto flex h-full w-full flex-col items-center justify-center">
                <h1 className="text-4xl font-bold tracking-tight text-black lg:text-6xl">
                  No cards found
                </h1>
                <p className="mt-4 text-xl text-black">
                  The current filter did not return any result.
                </p>
              </div>
            )}
            {showSectionDescription ? (
              <h3 className="mb-4 text-xl font-bold tracking-tight  text-gray-900">
                Cards you own
              </h3>
            ) : null}
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {cardsYouOwn
                .sort((lhs, rhs) => {
                  return lhs.lorcanitoCard.number - rhs.lorcanitoCard.number;
                })
                .map((card) => (
                  <GridItem
                    key={card.instanceId}
                    card={card}
                    setSelected={setSelected}
                    selected={selected}
                    bodyguardPresent={bodyguardPresent}
                  />
                ))}
            </div>
            {showSectionDescription ? (
              <h3 className="my-4 text-xl font-bold tracking-tight text-gray-900">
                Opponent's cards
              </h3>
            ) : null}
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {cardsYouDontOwn
                .sort((lhs, rhs) => {
                  return lhs.lorcanitoCard.number - rhs.lorcanitoCard.number;
                })
                .map((card) => (
                  <GridItem
                    key={card.instanceId}
                    card={card}
                    setSelected={setSelected}
                    selected={selected}
                    bodyguardPresent={bodyguardPresent}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </GenericModal>
  );
}

function GridItem({
  card,
  bodyguardPresent,
  selected,
  setSelected,
}: {
  card: CardModel;
  bodyguardPresent: boolean;
  selected?: CardModel;
  setSelected: (card: CardModel | undefined) => void;
}) {
  const cardHasBodyGuard = card.hasBodyguard;
  const canBeSelected =
    !bodyguardPresent || (bodyguardPresent && cardHasBodyGuard);

  return (
    <a
      key={card.instanceId}
      data-id-card={card.instanceId}
      onClick={() => {
        if (!canBeSelected) {
          return;
        }
        if (selected?.instanceId === card.instanceId) {
          setSelected(undefined);
        } else {
          setSelected(card);
        }
      }}
      className={`group relative cursor-pointer rounded-lg transition-all ease-linear hover:scale-110`}
    >
      {!canBeSelected ? (
        <CardImageOverlay isActive={!canBeSelected} isOver={!canBeSelected}>
          BODY GUARDED
        </CardImageOverlay>
      ) : null}

      <TargetCardImage
        card={card}
        selected={selected?.instanceId === card.instanceId}
      />
    </a>
  );
}

function TargetCardImage(props: { card: CardModel; selected?: boolean }) {
  const { card, selected } = props;

  return (
    <div
      className={`${
        selected ? "scale-110 border-indigo-500" : ""
      } relative aspect-card-image-name w-full overflow-hidden rounded-lg border-2 border-solid bg-gray-200 hover:border-indigo-500`}
    >
      <CardImageOverlay isActive={selected || false} isOver={false}>
        SELECTED
      </CardImageOverlay>
      <LorcanaCardImage hideCardText instanceId={card.instanceId} />
      <CardIcons card={card} />
    </div>
  );
}

export const TargetModal = observer(TargetModalComponent);
