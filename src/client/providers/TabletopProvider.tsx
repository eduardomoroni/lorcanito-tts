"use client";

export function TabletopProvider({
  children,
  game,
}: {
  children: JSX.Element;
  game: unknown;
  playerId?: string;
}) {
  return children;
}
