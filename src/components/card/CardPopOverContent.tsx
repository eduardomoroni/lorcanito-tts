import React from "react";

import { Button, Popover } from "antd";
import { observer } from "mobx-react-lite";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { CardModel } from "~/store/models/CardModel";
import { activatedAbilityPredicate } from "~/engine/rules/abilities/abilities";

const content: React.FC<{ card: CardModel }> = ({ card }) => {
  const store = useGameStore();
  const activatedAbilities = card.abilities.filter(activatedAbilityPredicate);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <Button
          className={"mr-1"}
          onClick={() => {
            store.cardStore.openChallengeModal(card);
          }}
        >
          Challenge
        </Button>
        <Button onClick={() => card.quest()}>Quest</Button>
      </div>
      {activatedAbilities.length ? (
        <div className="mt-1 flex-col">
          {activatedAbilities.map((ability) => {
            return (
              <Button
                className={"mr-2 w-full"}
                onClick={() => {
                  card.activate(ability.name);
                }}
              >
                {ability.name}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export const CardPopOverContent = observer(content);

const CardPopOverComponent: React.FC<{
  card: CardModel;
  children: React.ReactElement;
  owner?: string;
}> = ({ card, children, owner }) => {
  if (card.zone !== "play" || !card.ready || card.ownerId !== owner) {
    return children;
  }

  return (
    <Popover
      content={<CardPopOverContent card={card} />}
      placement="bottom"
      title="Card actions"
    >
      {children}
    </Popover>
  );
};

export const CardPopOver = observer(CardPopOverComponent);
