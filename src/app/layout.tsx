import type { Metadata } from "next";
import { Press_Start_2P, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Deep Dungeon | Built with Tambo.co",
    template: "%s | Deep Dungeon (Tambo.co Demo)",
  },
  description: "A voice-controlled procedural roguelite RPG built for the Tambo.co Hackathon. Experience the power of Tambo's Voice AI Director as it adapts the dungeon to your speech and playstyle.",
  keywords: ["Tambo.co", "Voice AI", "Hackathon", "WeMakeDevs", "RPG", "Roguelite", "AI Director", "Voice Control", "React", "Next.js"],
  authors: [{ name: "Samarth Saxena" }],
  creator: "Samarth Saxena",
  metadataBase: new URL("https://play-dungeon.samarthsaxena.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://play-dungeon.samarthsaxena.dev",
    title: "Deep Dungeon - Powered by Tambo.co Voice AI",
    description: "Built for the Tambo.co Hackathon. Control your destiny with voice commands in this adaptive AI roguelite.",
    siteName: "Deep Dungeon",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 600,
        alt: "Deep Dungeon Gameplay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Dungeon - Powered by Tambo.co Voice AI",
    description: "Built for the Tambo.co Hackathon. Control your destiny with voice commands in this adaptive AI roguelite.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
