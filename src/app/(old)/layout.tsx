import type { Metadata } from "next";
import React from "react";
import "~/styles/globals.css";
import "focus-visible";

export const metadata: Metadata = {
  title: "Lorcanito",
  description: "Disney Lorcana Tabletop simulator",
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className="h-full scroll-smooth bg-neutral-950 bg-white text-base antialiased antialiased [font-feature-settings:'ss01']"
      lang="en"
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lexend:wght@400;500&display=swap"
        />
      </head>
      <body className="relative flex h-full flex-col">{children}</body>
    </html>
  );
}

export default RootLayout;
