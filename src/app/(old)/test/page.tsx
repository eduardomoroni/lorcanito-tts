"use client";

import React from "react";
import { LoreAndInkCounter } from "~/client/components/counter/LoreAndInkCounter";

export default function Home() {
  return (
    <>
      <main className="flex items-center justify-center">
        <LoreAndInkCounter />
      </main>
    </>
  );
}
