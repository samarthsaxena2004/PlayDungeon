"use client";

import { useState } from "react";
import { useGameTambo } from "@/tambo/client";
import { generateStory } from "@/tambo/tools";

export default function Home() {

  const { render } = useGameTambo();
  const [started, setStarted] = useState(false);

  async function startGame() {
    setStarted(true);

    // First turn (mock today)
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

  // 👉 Tambo will render components here
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {render()}
    </div>
  );
}
