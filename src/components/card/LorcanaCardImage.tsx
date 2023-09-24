"use client";

import React, { type CSSProperties, type FC, useState } from "react";
import Image, { type ImageLoaderProps } from "next/image";
import { CardNotFound } from "~/components/card/CardNotFound";
import { FaceDownCard } from "~/components/card/FaceDownCard";
import { getCardFullName } from "~/spaces/table/deckbuilder/parseDeckList";
import { useGameStore } from "~/engine/lib/GameStoreProvider";
import { LorcanitoCard } from "~/engine/cards/cardTypes";
import { observer } from "mobx-react-lite";

export const cardLoader = ({ src, width }: ImageLoaderProps) => {
  if (src.includes("lorcania")) {
    return src + `?w=${width}`;
  }

  return `${src}?w=${width}&auto=format`;
};

function pad(n: number, length: number) {
  let len = length - ("" + n).length;
  return (len > 0 ? new Array(++len).join("0") : "") + n;
}

const ENCHANTED_MAP: Record<number, number> = {
  5: 205,
  21: 206,
  42: 207,
  51: 208,
  75: 209,
  88: 210,
  104: 211,
  114: 212,
  139: 213,
  142: 214,
  189: 215,
  193: 216,
};

export function createImgixUrl(
  card: LorcanitoCard,
  opt: {
    hideCardText?: boolean;
    imageOnly?: boolean;
  } = {},
): string {
  if (card.number === undefined && card.alternativeUrl) {
    return card.alternativeUrl;
  }

  const enchantedCard: number = ENCHANTED_MAP[card.number] || 0;
  let url = `https://lorcanito.imgix.net/images/cards/EN/001/${pad(
    enchantedCard || card.number,
    3,
  )}.webp?fm=avif&auto=format&q=65&w=250`;

  if (opt?.imageOnly) {
    url = url.replace("/001/", "/001/art_only/");
  } else if (opt?.hideCardText) {
    url = url.replace("/001/", "/001/art_and_name/");
  }

  return url;
}

type Props = {
  isFaceDown?: boolean;
  style?: CSSProperties;
  card?: LorcanitoCard;
  instanceId?: string;
  className?: string;
  hideCardText?: boolean;
  imageOnly?: boolean;
  onClick?: () => void;
  // This is to allow consumer to override the value
  fill?: boolean;
  width?: number;
  height?: number;
};

const LorcanaCardImageComponent: FC<Props> = ({
  className,
  isFaceDown,
  style,
  card,
  hideCardText,
  imageOnly,
  instanceId,
  onClick,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const mobXRootStore = useGameStore();
  card = card || mobXRootStore.cardStore.getCard(instanceId)?.lorcanitoCard;

  if (!card) {
    return <CardNotFound />;
  }

  if (isFaceDown) {
    return <FaceDownCard />;
  }

  return (
    <>
      {!isLoaded && (
        <Image
          fill
          style={style}
          loading="eager"
          className={`cursor-pointer select-none rounded-lg object-contain ${className}`}
          src={
            "https://lorcanito.imgix.net/images/tts/card/card-back.png?auto=format"
          }
          priority
          alt={getCardFullName(card)}
          {...rest}
        />
      )}
      <Image
        fill
        loading="lazy"
        onLoadingComplete={() => setIsLoaded(true)}
        style={style}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
        loader={cardLoader}
        className={`cursor-pointer select-none rounded-lg object-contain ${className}`}
        src={createImgixUrl(card, { imageOnly, hideCardText })}
        alt={getCardFullName(card)}
        {...rest}
      />
    </>
  );
};

export const LorcanaCardImage = observer(LorcanaCardImageComponent);
