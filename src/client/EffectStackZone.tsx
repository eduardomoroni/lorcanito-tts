import { ZoneOverlay } from "~/client/components/ZoneOverlay";
import React, { FC } from "react";
import { CardImage } from "~/client/components/image/CardImage";
import { useSetCardPreview } from "~/client/providers/CardPreviewProvider";

import { useGameController } from "~/client/hooks/useGameController";
import { StackLayersModal } from "~/client/StackLayersModal";

export const EffectStackZoneArena: FC = () => {
  const gameController = useGameController();
  const setCardPreview = useSetCardPreview();

  return (
    <div
      className={`flex h-full w-full grow overflow-y-auto rounded-lg p-1`}
      data-testid={"stack-layer-zone"}
    >
      <StackLayersModal />
      {gameController.pendingLayers.map((layer) => {
        const lorcanitoCard = layer.source.lorcanitoCard;
        return (
          <div
            key={layer.id}
            className={`relative z-10 mx-1 aspect-card-image-only h-full`}
            onMouseEnter={() => {
              setCardPreview({ card: layer.source.lorcanitoCard });
            }}
            onMouseLeave={() => setCardPreview(undefined)}
          >
            <CardImage
              imageOnly
              cardSet={lorcanitoCard.set}
              cardNumber={lorcanitoCard.number}
            />
          </div>
        );
      })}
      <ZoneOverlay>Stack Area</ZoneOverlay>
    </div>
  );
};
