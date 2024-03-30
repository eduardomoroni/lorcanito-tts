"use client";

import Link from "next/link";
import clsx from "clsx";
import React, { type FC } from "react";

type Variant = "solid" | "outline";
type Color = "slate" | "blue" | "white";

const baseStyles: Record<Variant, string> = {
  solid:
    "group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  outline:
    "group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none",
};

const variantStyles: Record<Variant, Record<Color, string>> = {
  solid: {
    slate:
      "bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900",
    blue: "bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600",
    white:
      "bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white",
  },
  outline: {
    slate:
      "ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300",
    white:
      "ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white",
    blue: "bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600",
  },
};

// TODO: ADD Button Props
export const Button: FC<{
  variant: Variant;
  color: Color;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  autoComplete?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}> = ({ variant = "solid", color = "slate", className, href, ...props }) => {
  className = clsx(
    baseStyles[variant],
    variantStyles[variant][color],
    className,
  );

  return href ? (
    // @ts-expect-error TODO: fix it
    <Link href={href} className={className} {...props} />
  ) : (
    <button className={className} {...props} />
  );
};
