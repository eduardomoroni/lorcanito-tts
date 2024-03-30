import React from "react";

export const DragNDropOverlay: React.FC<{
  isActive: boolean;
  isOver: boolean;
  children: string;
}> = ({ isActive, children, isOver }) => {
  if (!isActive) {
    return null;
  }

  return (
    <div
      className={` ${
        isOver ? "opacity-50" : ""
      } absolute inset-0 z-10 h-full w-full rounded border-2 border-dashed bg-white p-2 opacity-10 hover:border-gray-800 hover:opacity-50`}
    >
      {children}
    </div>
  );
};
