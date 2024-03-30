import React, { useEffect, useState } from "react";
import clsx from "clsx";

import { MobileFilterDialog } from "~/client/components/modals/target/MobileFilter";
import { TargetModalHeader } from "~/client/components/modals/target/TargetModalHeader";
import { GenericModal } from "~/client/components/modals/generic/GenericModal";
import { CardImage } from "~/client/components/image/CardImage";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { CardImageOverlay } from "~/client/components/card/CardImageOverlay";
import type { CardModel, Ability, TargetFilter } from "@lorcanito/engine";
import { observer } from "mobx-react-lite";
import { CardIcons } from "~/client/components/card-icons/CardIcons";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";
import { CardHotKeyOverlay } from "~/client/components/card/CardHotKeyOverlay";
import { bodyguardAbilityPredicate } from "@lorcanito/engine";

function TargetModalComponent(props: {
  activeFilters: TargetFilter[];
  source?: CardModel;
  responder?: string;
  onClose: () => void;
  onCancel: () => void;
  onTargetChosen: (cards: CardModel[]) => void;
  type: "challenge" | "sing" | Ability["type"] | "";
  title?: string | JSX.Element;
  subtitle?: string;
  mandatory?: boolean;
  amount?: number;
}) {
  const {
    activeFilters,
    source,
    onClose,
    onCancel,
    onTargetChosen,
    responder,
    type,
    title,
    subtitle,
    mandatory,
    amount = 1,
  } = props;

  const store = useGameStore();
  const [open, setOpen] = useState(false);
  const filteredTableCards = store.cardStore.getCardsByFilter(
    activeFilters,
    responder,
    source,
  );
  const [selected, setSelected] = useState<CardModel[]>([]);

  useEffect(() => {
    if (selected.length > 0 && amount === 1) {
      onTargetChosen(selected);
      onClose();
    }
  }, [selected]);

  useEffect(() => {
    if (filteredTableCards.length === 0) {
      onCancel();
      console.log("No cards found, closing modal");
      console.log(source?.fullName);
      console.log(activeFilters);
    }
  }, [filteredTableCards.length]);

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

  const selectCallback = (card: CardModel) => {
    if (selected?.includes(card)) {
      setSelected(selected.filter((c) => c.instanceId !== card.instanceId));
    } else {
      setSelected([...selected, card]);
    }
  };

  return (
    <GenericModal
      title={title || "Choose a target"}
      subtitle={subtitle || ""}
      open={true}
      cancellable={!mandatory || filteredTableCards.length === 0}
      onCancel={onCancel}
      onConfirm={() => {
        if (selected.length > amount) {
          store.sendNotification({
            type: "icon",
            title: `You cannot chose more than ${amount} cards`,
            message: `If you think this is a mistake, you can use "manual mode" to override this.`,
            icon: "warning",
            autoClear: true,
          });
          return;
        }

        // TODO: does this allow players to confirm without choosing a target?
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
          <div
            className="mx-auto max-w-2xl p-8 lg:max-w-7xl"
            data-testid="target-modal-cards"
          >
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
                .map((card, index) => (
                  <GridItem
                    key={card.instanceId}
                    card={card}
                    setSelected={selectCallback}
                    selected={
                      !!selected.find(
                        (item) => card.instanceId === item.instanceId,
                      )
                    }
                    bodyguardPresent={bodyguardPresent}
                    index={index}
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
                .map((card, index) => (
                  <GridItem
                    key={card.instanceId}
                    card={card}
                    setSelected={selectCallback}
                    selected={
                      !!selected.find(
                        (item) => card.instanceId === item.instanceId,
                      )
                    }
                    bodyguardPresent={bodyguardPresent}
                    index={cardsYouOwn.length + index}
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
  index,
}: {
  card: CardModel;
  bodyguardPresent: boolean;
  selected?: boolean;
  setSelected: (card: CardModel | undefined) => void;
  index: number;
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
        setSelected(card);
      }}
      className={clsx(
        `group relative cursor-pointer rounded-lg transition-all ease-linear hover:scale-110`,
        "box-border border-2 border-solid border-amber",
        !card.ready && "rotate-12",
      )}
    >
      <CardHotKeyOverlay
        card={card}
        zone={"modal"}
        index={index}
        callback={() => setSelected(card)}
      />

      {!canBeSelected ? (
        <CardImageOverlay isActive={!canBeSelected} isOver={!canBeSelected}>
          BODY GUARDED
        </CardImageOverlay>
      ) : null}

      <TargetCardImage card={card} selected={selected} index={index} />
    </a>
  );
}

function TargetCardImage(props: {
  card: CardModel;
  selected?: boolean;
  index: number;
}) {
  const { card, selected, index } = props;
  const setCardPreview = useSetCardPreview();
  const lorcanitoCard = card.lorcanitoCard;

  return (
    <div
      onMouseEnter={() => setCardPreview({ card: card.lorcanitoCard })}
      onMouseLeave={() => setCardPreview(undefined)}
      className={clsx(
        selected ? "scale-110 border-indigo-500" : "",
        "box-border border-2 border-solid border-amber",
        `relative aspect-card-image-name w-full overflow-hidden rounded-lg border-2 border-solid bg-gray-200 hover:border-indigo-500`,
      )}
    >
      <CardImageOverlay isActive={selected || false} isOver={false}>
        SELECTED
      </CardImageOverlay>
      <CardImage
        hideCardText
        cardSet={lorcanitoCard.set}
        cardNumber={lorcanitoCard.number}
      />
      <CardIcons card={card} />
    </div>
  );
}

export const TargetModal = observer(TargetModalComponent);
