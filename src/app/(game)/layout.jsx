import { RootLayout } from "@/components/RootLayout";

import "@/styles/tailwind.css";

export const metadata = {
  title: {
    template: "%s - Lorcanito",
    default: "Lorcanito - Play Disney Lorcana Online",
  },
};

export default function Layout({ children, ...rest }) {
  return (
    <html
      lang="en"
      className="dark h-screen max-h-screen bg-neutral-950 text-base antialiased"
    >
      <body className="flex h-screen max-h-screen flex-col">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
