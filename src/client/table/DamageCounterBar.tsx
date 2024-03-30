import React from "react";
import { DamageCounter } from "~/client/table/DamageCounter";

export function DamageCounterBar() {
  return (
    <div
      className={`z-10 flex w-12 flex-col rounded-lg bg-slate-800 p-2 opacity-25 transition-all duration-500 hover:opacity-50`}
    >
      {[...Array(6).keys()].map((number) => {
        return (
          <div
            key={number}
            className={`duration-250 my-1 flex cursor-pointer items-center justify-center transition-all hover:scale-125`}
          >
            <DamageCounter damage={number + 1} />
          </div>
        );
      })}
    </div>
  );
}
