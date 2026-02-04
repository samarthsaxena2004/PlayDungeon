import type { Metadata } from "next";
import { Press_Start_2P, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans", // Mapping to --font-sans as per globals.css
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PlayDungeon",
  description: "Deep Dungeon - AI Generated RPG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
