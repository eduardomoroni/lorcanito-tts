import type { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import type { FC, ReactNode } from "react";

export const NavLink: FC<{ children: ReactNode; href: Url }> = ({
  href,
  children,
}) => (
  <Link
    href={href}
    className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  >
    {children}
  </Link>
);
