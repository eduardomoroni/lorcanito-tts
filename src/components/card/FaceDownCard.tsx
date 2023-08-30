import React, { type FC } from "react";
import Image from "next/image";

export const FaceDownCard: FC = ({}) => {
  return (
    <Image
      fill
      loading="eager"
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
      className="h-full w-full cursor-pointer select-none rounded-lg border-2 border-transparent object-contain hover:border-indigo-500"
      src="https://lorcanito.imgix.net/images/tts/card/card-back.png?auto=format"
      alt={"Face down card"}
    />
  );
};
