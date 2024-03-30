import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "~/client/components/Footer";
import { Header } from "~/client/components/header/Header";
import { Hero } from "~/client/components/Hero";

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
