import { Footer } from "~/components/Footer";
import { Header } from "~/components/header/StaticHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lorcanito - How to use",
  description: "Play Disney Lorcana Online.",
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex items-center justify-center">
        <iframe
          width="1200"
          height="630"
          src="https://www.youtube.com/embed/89FZRE7xp0I"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </main>
      <Footer />
    </>
  );
}
