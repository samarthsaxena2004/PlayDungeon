"use client";

import { useState } from "react";
import { useGameTambo } from "@/tambo/client";
import { Tambo } from "@tambo-ai/react";
import { generateStory } from "@/tambo/tools";

export default function Home() {

  const tambo = useGameTambo();
  const [started, setStarted] = useState(false);

  async function startGame() {
    setStarted(true);

    await generateStory("start", {
      health: 100,
      mana: 50,
      inventory: [],
      location: "cell",
    });
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <button
          onClick={startGame}
          className="border-4 border-white p-6 text-white hover:bg-white hover:text-black"
        >
          START PLAYDUNGEON
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <Tambo />
    </div>
  );
}
