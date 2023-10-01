import React from "react";

export const ZoneOverlay: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="absolute inset-0 flex h-full w-full select-none items-center justify-center rounded-lg bg-black text-lg text-white opacity-25">
      {children}
    </div>
  );
};
