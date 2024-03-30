"use client";

import React, { type CSSProperties, type FC, useState } from "react";
import Image from "next/image";
import { CardNotFound } from "~/client/components/image/CardNotFound";
import { FaceDownCard } from "~/client/components/image/FaceDownCard";
import type { LorcanitoCard } from "@lorcanito/engine";
import { observer } from "mobx-react-lite";
import { useLocalStorage } from "@uidotdev/usehooks";
import clsx from "clsx";
import { cardLoader } from "~/client/components/image/CardLoader";
import { createCardUrl } from "~/client/components/image/createCardUrl";

type Props = {
  isFaceDown?: boolean;
  style?: CSSProperties;
  card?: LorcanitoCard;
  className?: string;
  hideCardText?: boolean;
  imageOnly?: boolean;
  // This is to allow consumer to override the value
  fill?: boolean;
  width?: number;
  height?: number;
  cardSet?: LorcanitoCard["set"];
  cardNumber?: number;
};

const LorcanaCardImageComponent: FC<Props> = ({
  className,
  isFaceDown,
  card,
  hideCardText,
  imageOnly,
  cardSet,
  cardNumber,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  // TODO: Remove this
  const [language] = useLocalStorage<"EN" | "DE" | "FR">("language", "EN");

  if (!cardSet || !cardNumber) {
    return <CardNotFound />;
  }

  if (isFaceDown) {
    return <FaceDownCard />;
  }

  return (
    <>
      {!isLoaded ? (
        <Image
          fill
          priority
          unoptimized
          loading="eager"
          className={`cursor-pointer select-none rounded-lg object-contain ${className}`}
          src={"https://six-inks.pages.dev/assets/images/cards/card-back.avif"}
          alt={`${cardSet}-${cardNumber}`}
        />
      ) : null}
      <Image
        fill
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
        loader={cardLoader}
        className={clsx(
          `cursor-pointer select-none rounded-lg object-contain`,
          className,
        )}
        src={createCardUrl(cardSet, cardNumber, {
          imageOnly,
          hideCardText,
          language,
        })}
        alt={`${cardSet}-${cardNumber}`}
      />
    </>
  );
};

// TODO: Simplify This
export const CardImage = observer(LorcanaCardImageComponent);
