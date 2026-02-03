import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayDungeon",
  description: "AI Dungeon Master powered by Tambo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-mono">
        
        <div className="max-w-3xl mx-auto">
          
          <header className="p-4 border-b border-white">
            <h1 className="text-2xl tracking-wide">
              PlayDungeon
            </h1>
          </header>

          {children}

        </div>

      </body>
    </html>
  );
}
