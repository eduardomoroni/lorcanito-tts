import { ZoneOverlay } from "~/spaces/components/ZoneOverlay";
import React, { FC, useEffect } from "react";
import { LorcanaCardImage } from "~/spaces/components/card/LorcanaCardImage";
import { useCardPreview } from "~/spaces/providers/CardPreviewProvider";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { useTargetModal } from "~/spaces/providers/TargetModalProvider";
import { CardModel } from "~/engine/store/models/CardModel";
import { useYesOrNoModal } from "~/spaces/providers/YesOrNoModalProvider";
import { useScryModal } from "~/spaces/providers/ScryModalProvider";
import { scryEffectPredicate } from "~/engine/rules/effects/effectTypes";
import { staticTriggeredAbilityPredicate } from "~/engine/rules/abilities/abilities";

// The game does not have a stack, but I want to add one.
// This is a temporary step while not all cards are coded.
export const EffectStackZoneArena: FC = () => {
  const store = useGameStore();
  const pendingEffects = store.tableStore.getPendingEffects();
  const setCardPreview = useCardPreview();
  const { openTargetModal } = useTargetModal();
  const openYesOrNoModal = useYesOrNoModal();
  const openScryModal = useScryModal();
  const topOfStack = pendingEffects[pendingEffects.length - 1];
  const activePlayerOwnsTheEffect =
    store.activePlayer === topOfStack?.source.ownerId;

  const selectTarget = () => {
    if (!topOfStack) {
      console.log("No top of stack");
      return;
    }

    const ability = topOfStack.ability;

    let callback = (target?: CardModel) => {
      topOfStack.resolve({ targetId: target?.instanceId });
    };
    let onCancel = () => {
      topOfStack.cancel();
    };

    const title = ability.name || topOfStack.source.fullName;
    const subtitle = ability.text || topOfStack.source.lorcanitoCard.text || "";
    const filters = topOfStack.effectCardFilters();

    // Musketeer tabard, coconut
    const musk = ability.optional;
    // Ursula's cauldron
    const scryEffect = ability?.effects?.find(scryEffectPredicate);

    if (scryEffect) {
      // TODO: THIS IS NOT IDEAL, it breaks encapsulation
      console.log("scry effect", JSON.stringify(scryEffect));
      openScryModal({
        ...scryEffect,
        title,
        subtitle,
        callback: (params) => topOfStack.resolve({ scry: params }),
      });
    } else if (musk) {
      openYesOrNoModal({
        title: `Would you like to activate: ${title}`,
        text: subtitle,
        onYes: () => {
          // musketeer tabard
          if (ability?.effects?.filter((e) => e.type === "draw")) {
            topOfStack.resolve({ player: "self" });
            return;
          }

          // THERE ARE EFFECTS THAT TARGET ALL CARDS: jasmine for instance

          if (staticTriggeredAbilityPredicate(ability)) {
            openTargetModal({
              title: `Choose a target for ${title}`,
              subtitle: subtitle,
              filters: filters,
              callback: callback,
              onCancel,
              type: topOfStack.ability.type,
            });
          }
        },
        onNo: () => {
          onCancel();
        },
      });
    } else {
      openTargetModal({
        title: `Choose a target for ${title}`,
        subtitle: subtitle,
        filters: filters,
        callback: callback,
        onCancel,
        type: topOfStack.ability.type,
      });
    }
  };

  useEffect(() => {
    if (!activePlayerOwnsTheEffect) {
      return;
    }

    selectTarget();
  }, [pendingEffects.length]);

  const clearEffect = () => {
    pendingEffects.forEach((effect) => {
      effect.cancel();
    });
  };

  // Only show the button to turn player
  return (
    <div className={`flex h-full w-full grow overflow-y-auto rounded-lg p-1`}>
      {activePlayerOwnsTheEffect ? (
        <>
          <div
            className="z-10 flex h-full -rotate-180 cursor-pointer select-none flex-col items-center justify-center rounded bg-red-800 px-2 font-mono text-xl font-bold text-white underline hover:bg-red-500"
            onClick={clearEffect}
            style={{ writingMode: "vertical-rl" }}
          >
            <span>CANCEL</span>
            <span>EFFECT</span>
          </div>
          <div
            className="z-10 mx-2 flex h-full -rotate-180 cursor-pointer select-none flex-col items-center justify-center rounded bg-green-800 px-2 font-mono text-xl font-bold text-white underline hover:bg-green-500"
            onClick={selectTarget}
            style={{ writingMode: "vertical-rl" }}
          >
            <span>SELECT</span>
            <span>TARGET</span>
          </div>
        </>
      ) : null}

      {pendingEffects.map((effect) => {
        const instanceId = effect.source.instanceId;
        const lorcanitoCard =
          store.cardStore.getCard(instanceId)?.lorcanitoCard;

        return (
          <div
            key={effect.source.instanceId + effect.ability.name}
            className={`z-10 mx-1`}
            onMouseEnter={() => {
              setCardPreview({ instanceId: instanceId });
            }}
            onMouseLeave={() => setCardPreview(undefined)}
          >
            <LorcanaCardImage
              card={lorcanitoCard}
              fill={undefined}
              width={108}
              height={150}
            />
          </div>
        );
      })}
      <ZoneOverlay>Stack Area</ZoneOverlay>
    </div>
  );
};
