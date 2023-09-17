import React from "react";
import { observer } from "mobx-react-lite";

import type { CardModel } from "~/store/models/CardModel";
import { DamageCounter } from "~/spaces/table/DamageCounter";
import { BonusStrength } from "~/components/card-icons/status/BonusStrength";
import { FreshInk } from "~/components/card-icons/status/FreshInk";
import { BonusLore } from "~/components/card-icons/status/BonusLore";
import { QuestRestriction } from "~/components/card-icons/status/QuestRestriction";
import { ChallengeRestriction } from "~/components/card-icons/status/ChallengeRestriction";

// Abilities
import { WardIcon } from "~/components/card-icons/abilities/WardIcon";
import { SupportIcon } from "~/components/card-icons/abilities/SupportIcon";
import { SingerIcon } from "~/components/card-icons/abilities/SingerIcon";
import { EvasiveIcon } from "~/components/card-icons/abilities/EvasiveIcon";
import { ChallengerIcon } from "~/components/card-icons/abilities/ChallengerIcon";
import { RushIcon } from "~/components/card-icons/abilities/RushIcon";
import { BodyguardIcon } from "~/components/card-icons/abilities/BodyguardIcon";
import { RecklessIcon } from "~/components/card-icons/abilities/RecklessIcon";
import { ExertedIcon } from "~/components/card-icons/status/ExertedIcon";

function CardIconsComponent(props: { card: CardModel }) {
  const { card } = props;
  const className = "rounded bg-black text-white mr-1";

  const strengthBonus = card.strength - (card.lorcanitoCard.strength || 0);
  return (
    <div className={`absolute bottom-0 z-20 flex w-full`}>
      <DamageCounter damage={card?.meta?.damage} />
      {strengthBonus ? (
        <BonusStrength bonus={strengthBonus} className={className} />
      ) : null}
      {card.lore > (card.lorcanitoCard.lore || 0) ? (
        <BonusLore className={className} />
      ) : null}
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
      {!card.ready ? <ExertedIcon className={className} /> : null}
    </div>
  );
}

export const CardIcons = observer(CardIconsComponent);
