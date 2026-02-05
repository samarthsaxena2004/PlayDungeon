import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 font-press-start text-center">
      <h1 className="text-4xl md:text-6xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 animate-pulse">
        DEEP DUNGEON
      </h1>
      <p className="text-gray-400 mb-12 max-w-md leading-7">
        Descend into the darkness. Face your fears. <br />
        Powered by Tambo AI.
      </p>

      <Link href="/play">
        <Button size="lg" className="px-8 py-6 text-xl bg-red-700 hover:bg-red-600 text-white border-2 border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all hover:scale-105">
          ENTER THE DUNGEON
        </Button>
      </Link>

      <div className="mt-20 text-xs text-gray-600">
        <p>Built for WeMakeDevs Tambo Hackathon</p>
      </div>
    </div>
  );
}
