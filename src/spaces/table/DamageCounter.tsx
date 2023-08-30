import React from "react";
import Defense from "~/../public/images/icons/defense.svg";
import Image from "next/image";

export function DamageCounter(props: { damage?: number | null }) {
  if (!props.damage) {
    return null;
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-solid border-black bg-gray-200 p-1">
      <span className="text-center align-middle accent-slate-950">
        {props.damage}
      </span>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Image src={Defense} alt="Damage taken" width={12} height={12} />
    </div>
  );
}
