import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { CardImage } from "~/client/components/image/CardImage";
import { useGameStore } from "~/client/providers/GameStoreProvider";
import { Tooltip } from "antd";

const CardEffectsBarComponent: FC = () => {
  const store = useGameStore();
  const activeEffects = store.getActiveEffects();

  if (!activeEffects) {
    return null;
  }

  return null;

  return (
    <div
      className={`absolute flex max-h-full w-40 flex-col overflow-y-hidden rounded-lg`}
    >
      <span className="font-bold text-white">Active Effects</span>
      <div className="grid grid-cols-1 gap-y-1  overflow-auto">
        {activeEffects.toReversed().map((effect) => {
          const card = effect.source.lorcanitoCard;
          const lorcanitoCard = effect.target?.lorcanitoCard;

          return (
            <div className="relative flex">
              <div className="h-32 cursor-default">
                <Tooltip placement="right" title={effect.source.fullName}>
                  <CardImage
                    className="cursor-default"
                    imageOnly={true}
                    cardSet={card.set}
                    cardNumber={card.number}
                  />
                </Tooltip>
              </div>
              {lorcanitoCard ? (
                <div className="h-32 cursor-default">
                  <Tooltip placement="right" title={effect.target?.fullName}>
                    <CardImage
                      className="absolute translate-x-1/2 cursor-default"
                      imageOnly={true}
                      cardSet={lorcanitoCard.set}
                      cardNumber={lorcanitoCard.number}
                    />
                  </Tooltip>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ActiveEffects = observer(CardEffectsBarComponent);
