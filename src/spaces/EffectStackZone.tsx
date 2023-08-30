import { ZoneOverlay } from "~/components/ZoneOverlay";
import React, { FC, useEffect } from "react";
import { LorcanaCardImage } from "~/components/card/LorcanaCardImage";
import { useCardPreview } from "~/providers/CardPreviewProvider";
import { useGameController } from "~/engine/rule-engine/lib/GameControllerProvider";
import { useTargetModal } from "~/providers/TargetModalProvider";
import { TableCard } from "~/providers/TabletopProvider";

// The game does not have a stack, but I want to add one.
// This is a temporary step while not all cards are coded.
export const EffectStackZoneArena: FC = () => {
  const controller = useGameController();
  const pendingEffects = controller.getPendingEffects();
  const setCardPreview = useCardPreview();
  const { openTargetModal } = useTargetModal();
  const topOfStack = pendingEffects[pendingEffects.length - 1];
  const activePlayerOwnsTheEffect =
    controller.findCardOwner(topOfStack?.instanceId) ===
    controller.getActivePlayer();

  const selectTarget = () => {
    if (!topOfStack) {
      return;
    }

    const ability = topOfStack.ability;

    let callback = (target: TableCard) => {};

    if (ability.effect === "shuffle") {
      callback = (target: TableCard) => {
        controller.shuffleCardIntoDeck({
          instanceId: target.instanceId,
          from: "discard",
        });
        controller.resolveEffect({
          effectId: topOfStack.id,
          targetId: target.instanceId,
        });
      };
    }

    openTargetModal({
      title: `Choose a target for ${ability.name}`,
      subtitle: ability.text,
      filters: ability.filters,
      callback: callback,
      onCancel: () => {
        controller.resolveEffect({
          effectId: topOfStack.id,
          targetId: undefined,
        });
      },
      type: "resolution",
    });
  };

  useEffect(() => {
    if (!activePlayerOwnsTheEffect) {
      return;
    }

    selectTarget();
  }, [pendingEffects.length]);

  const clearEffect = () => {
    const id = topOfStack?.id;
    if (id === undefined) {
      pendingEffects.forEach((effect) => {
        controller.resolveEffect({
          effectId: effect.id,
          targetId: undefined,
        });
      });
    } else {
      pendingEffects.forEach((effect) => {
        controller.resolveEffect({
          effectId: id,
          targetId: undefined,
        });
      });
    }
  };

  // Only show the button to turn player
  return (
    <div className={`flex h-full w-full grow overflow-y-auto rounded-lg p-1`}>
      {activePlayerOwnsTheEffect ? (
        <>
          <div
            className="z-10 flex h-full -rotate-180 cursor-pointer select-none flex-col items-center justify-center rounded bg-green-800 px-2 font-mono text-xl font-bold text-white underline hover:bg-green-500"
            onClick={clearEffect}
            style={{ writingMode: "vertical-rl" }}
          >
            <span>RESOLVE</span>
            <span>EFFECT</span>
          </div>
          <div
            className="z-10 flex h-full -rotate-180 cursor-pointer select-none flex-col items-center justify-center rounded bg-green-800 px-2 font-mono text-xl font-bold text-white underline hover:bg-green-500"
            onClick={selectTarget}
            style={{ writingMode: "vertical-rl" }}
          >
            <span>SELECT</span>
            <span>TARGET</span>
          </div>
        </>
      ) : null}

      {pendingEffects.map((effect) => {
        const instanceId = effect.instanceId;
        const lorcanitoCard = controller.findLorcanitoCard(instanceId);

        return (
          <div
            key={effect.instanceId + effect.ability.name}
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
