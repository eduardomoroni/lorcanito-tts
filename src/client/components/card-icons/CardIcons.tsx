import React from "react";
import { observer } from "mobx-react-lite";

import type { CardModel } from "@lorcanito/engine";
import { DamageCounter } from "~/client/table/DamageCounter";
import { BonusStrength } from "~/client/components/card-icons/status/BonusStrength";
import { FreshInk } from "~/client/components/card-icons/status/FreshInk";
import { BonusLore } from "~/client/components/card-icons/status/BonusLore";
import { QuestRestriction } from "~/client/components/card-icons/status/QuestRestriction";
import { ChallengeRestriction } from "~/client/components/card-icons/status/ChallengeRestriction";

// Abilities
import { WardIcon } from "~/client/components/card-icons/abilities/WardIcon";
import { SupportIcon } from "~/client/components/card-icons/abilities/SupportIcon";
import { SingerIcon } from "~/client/components/card-icons/abilities/SingerIcon";
import { EvasiveIcon } from "~/client/components/card-icons/abilities/EvasiveIcon";
import { ChallengerIcon } from "~/client/components/card-icons/abilities/ChallengerIcon";
import { RushIcon } from "~/client/components/card-icons/abilities/RushIcon";
import { BodyguardIcon } from "~/client/components/card-icons/abilities/BodyguardIcon";
import { RecklessIcon } from "~/client/components/card-icons/abilities/RecklessIcon";
import { ExertedIcon } from "~/client/components/card-icons/status/ExertedIcon";
import { ResistIcon } from "~/client/components/card-icons/abilities/ResistIcon";

function CardIconsComponent(props: { card: CardModel }) {
  const { card } = props;
  const className = "rounded bg-black text-white mr-1";
  const strengthBonus = card.strength - (card.lorcanitoCard.strength || 0);
  const loreBonus = card.lore - (card.lorcanitoCard.lore || 0);

  return (
    <div
      className={`absolute bottom-0 z-20 flex`}
      data-testid={`card-icons-${card.instanceId}`}
    >
      <DamageCounter damage={card?.meta?.damage} />
      {strengthBonus ? (
        <BonusStrength bonus={strengthBonus} className={className} />
      ) : null}
      {loreBonus ? <BonusLore className={className} bonus={loreBonus} /> : null}
      {card.type === "character" && card.meta.playedThisTurn ? (
        <FreshInk className={className} />
      ) : null}
      {card.hasChallengeRestriction ? (
        <ChallengeRestriction className={className} />
      ) : null}
      {card.hasQuestRestriction ? (
        <QuestRestriction className={className} />
      ) : null}
      {card.hasWard ? <WardIcon className={className} /> : null}
      {card.hasSupport ? <SupportIcon className={className} /> : null}
      {card.hasSinger ? <SingerIcon className={className} /> : null}
      {card.hasEvasive ? <EvasiveIcon className={className} /> : null}
      {card.hasChallenger ? <ChallengerIcon className={className} /> : null}
      {card.hasRush ? <RushIcon className={className} /> : null}
      {card.hasBodyguard ? <BodyguardIcon className={className} /> : null}
      {card.hasReckless ? <RecklessIcon className={className} /> : null}
      {card.hasResist ? <ResistIcon className={className} /> : null}
      {!card.ready ? <ExertedIcon className={className} /> : null}
    </div>
  );
}

export const CardIcons = observer(CardIconsComponent);
