import React from "react";

export function CardCounter(props: { length: number }) {
  return (
    <div className="absolute left-1/2 top-1/2 z-20 box-border flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 justify-center rounded-full border-2 border-solid border-black bg-white align-middle opacity-0 group-hover:opacity-75">
      <span className="text-center align-middle accent-slate-950">
        {props.length}
      </span>
    </div>
  );
}
