import React from "react";

export function CardImageOverlay(props: {
  children: React.ReactNode;
  isActive: boolean;
  isOver: boolean;
}) {
  const { isActive, children, isOver } = props;

  return (
    <div
      className={`${
        isActive ? "border-2 border-black opacity-25" : "opacity-0"
      } ${
        isOver ? "opacity-50" : ""
      } absolute inset-0 z-20 flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed bg-white transition-all ease-linear`}
    >
      <span className="border-2 border-black py-4 font-mono text-4xl font-extrabold tracking-tight text-gray-900">
        {children}
      </span>
    </div>
  );
}
