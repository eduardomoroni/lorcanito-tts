import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "~/spaces/components/Footer";
import { Header } from "~/spaces/components/header/Header";
import { Hero } from "~/spaces/components/Hero";

export const metadata: Metadata = {
  title: "Lorcanito - Play Disney Lorcana Online",
  description: "Play Disney Lorcana Online.",
};

export default function Home() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>
      <main>
        {/*<LobbyList />*/}
        <Hero />
      </main>
      <Footer />
    </>
  );
}
