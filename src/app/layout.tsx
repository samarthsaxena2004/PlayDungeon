import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
