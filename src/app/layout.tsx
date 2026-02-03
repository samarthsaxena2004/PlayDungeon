import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "PlayDungeon",
  description: "Neo-Brutalist AI Dungeon Master",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono antialiased bg-black text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
