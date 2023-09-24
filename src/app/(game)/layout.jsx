import { RootLayout } from "@/components/RootLayout";

import "@/styles/tailwind.css";

export const metadata = {
  title: {
    template: "%s - Lorcanito",
    default: "Lorcanito - Play Disney Lorcana Online",
  },
};

export default function Layout({ children }) {
  return (
    <html
      lang="en"
      className="h-screen max-h-screen bg-neutral-950 text-base antialiased dark"
    >
      <body className="flex h-screen max-h-screen flex-col">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
