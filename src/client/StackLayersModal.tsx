import React, { FC, useEffect, useLayoutEffect } from "react";
import { useTargetModal } from "~/client/providers/TargetModalProvider";
import { CardModel } from "@lorcanito/engine";
import { useYesOrNoModal } from "~/client/providers/YesOrNoModalProvider";
import { useScryModal } from "~/client/providers/ScryModalProvider";
import { useGameController } from "~/client/hooks/useGameController";
import { scryEffectPredicate } from "@lorcanito/engine";

export const StackLayersModal: FC = () => {
  const gameController = useGameController();

  const { openTargetModal, closeTargetModal } = useTargetModal();
  const { openYesOrNoModal, closeYesOrNoModal } = useYesOrNoModal();
  const { openScryModal, closeScryModal } = useScryModal();

  const pendingLayers = gameController.pendingLayers;
  const topOfStack = pendingLayers[pendingLayers.length - 1];
  const activePlayerRespondingTheEffect =
    gameController.activePlayer === topOfStack?.responder;

  const closeModal = () => {
    closeTargetModal();
    closeYesOrNoModal();
    closeScryModal();
  };

  // TODO: This modal needs to update real time, because the effect can change
  // We could also resolve the issue with IDs being generated on the server side
  const openModal = async () => {
    closeModal();

    if (pendingLayers.length === 0 || !topOfStack) {
      console.log("No top of stack");
      return;
    }

    const title = topOfStack.name;
    const subtitle = topOfStack.description;
    if (topOfStack.isOptional() && !topOfStack.ability.accepted) {
      return openYesOrNoModal({
        title: `Would you like to activate: ${title}`,
        text: subtitle,
        onYes: async () => {
          await gameController.acceptOptionalLayer();
        },
        onNo: async () => {
          await gameController.skipLayer(topOfStack);
        },
      });
    }

    const scryEffect = topOfStack.getScryEffect();
    if (scryEffectPredicate(scryEffect)) {
      return openScryModal({
        // TODO: THIS IS NOT IDEAL, it breaks encapsulation
        ...scryEffect,
        title,
        subtitle,
        callback: (params) =>
          gameController.resolveTopLayer({
            scry: params,
          }),
      });
    }

    const filters = topOfStack.effectCardFilters();
    if (filters?.length > 0) {
      const amount = topOfStack.targetAmount();

      return openTargetModal({
        title,
        subtitle,
        filters,
        responder: topOfStack.responder,
        type: topOfStack.ability.type,
        mandatory: !topOfStack.isOptional(),
        source: topOfStack.source,
        amount: typeof amount === "number" ? amount : undefined,
        callback: (targets: CardModel[]) => {
          gameController.resolveTopLayer({ targets });
        },
        onCancel: () => {
          gameController.skipLayer(topOfStack);
        },
      });
    }
  };

  useEffect(() => {
    if (
      pendingLayers.length === 0 ||
      !topOfStack ||
      !activePlayerRespondingTheEffect
    ) {
      closeModal();
      return;
    }

    openModal();
  }, [
    pendingLayers.length,
    topOfStack?.id,
    topOfStack?.ability.accepted,
    gameController.isLoading,
  ]);

  useLayoutEffect(() => {
    if (pendingLayers.length === 0) {
      closeModal();
    }
  }, [gameController.isLoading, pendingLayers.length]);

  const clearEffect = async () => {
    if (topOfStack) {
      await gameController.skipLayer(topOfStack);
    }
  };

  return (
    <>
      {activePlayerRespondingTheEffect || gameController.manualMode ? (
        <div
          className="z-10 flex h-full -rotate-180 cursor-pointer select-none flex-col items-center justify-center rounded bg-red-800 px-2 font-mono text-xl font-bold text-white underline hover:bg-red-500"
          onClick={clearEffect}
          style={{ writingMode: "vertical-rl" }}
        >
          <span>SKIP</span>
          <span>EFFECT</span>
        </div>
      ) : null}

      {activePlayerRespondingTheEffect ? (
        <div
          className="z-10 mx-2 flex h-full -rotate-180 cursor-pointer select-none flex-col items-center justify-center rounded bg-green-800 px-2 font-mono text-xl font-bold text-white underline hover:bg-green-500"
          onClick={() => openModal()}
          style={{ writingMode: "vertical-rl" }}
        >
          <span>SELECT</span>
          <span>TARGET</span>
        </div>
      ) : null}
    </>
  );
};
