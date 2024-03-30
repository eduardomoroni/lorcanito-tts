import { FC } from "react";
import Image from "next/image";

export const InkwellIcon: FC<{ ink?: boolean; cost?: number }> = (props) => {
  const { ink, cost } = props;
  return (
    <div className={"relative flex h-10 w-10"}>
      <Image
        src={
          ink
            ? "https://six-inks.pages.dev/assets/images/tts/icons/inkpot.svg"
            : "https://six-inks.pages.dev/assets/images/tts/icons/inkless.svg"
        }
        fill
        className="mr-1 inline-block"
        alt={ink ? "Inkwell card" : "Inkless card"}
      />
      {cost ? (
        <span className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 text-sm text-white">
          {cost}
        </span>
      ) : null}
    </div>
  );
};
