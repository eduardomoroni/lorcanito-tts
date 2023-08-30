import React, { type FC } from "react";
import Image from "next/image";
import { CardImageOverlay } from "~/components/card/CardImageOverlay";

export const CardNotFound: FC = ({}) => {
  return (
    <div className="relative flex flex-grow">
      <CardImageOverlay isActive={true} isOver={false}>
        Card not found, please refresh
      </CardImageOverlay>
      <Image
        fill
        loading="eager"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
        className="h-full w-full cursor-pointer select-none rounded-lg border-2 border-transparent object-contain grayscale hover:border-indigo-500"
        src="https://lorcanito.imgix.net/images/tts/card/card-back.png?auto=format"
        alt={"Face down card"}
      />
    </div>
  );
};
