"use client";

import { useState } from "react";
import { generateStory } from "@/tambo/tools";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [story, setStory] = useState("");
  const [choices, setChoices] = useState<any[]>([]);

  async function startGame() {
    setStarted(true);

    const res = await generateStory("start", {
      health: 100,
      mana: 50,
      inventory: [],
      location: "cell",
    });

    setStory(res.story);
    setChoices(res.choices);
  }

  async function onChoice(id: string) {
    const res = await generateStory(id, {
      health: 100,
      mana: 50,
      inventory: [],
      location: "cell",
    });

    setStory(res.story);
    setChoices(res.choices);
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
      <div className="border-4 border-white p-6">
        <pre className="whitespace-pre-wrap">{story}</pre>
      </div>

      <div className="mt-4 space-y-2">
        {choices.map((c) => (
          <button
            key={c.id}
            onClick={() => onChoice(c.id)}
            className="block w-full border-2 border-white p-3 hover:bg-white hover:text-black"
          >
            {c.text}
          </button>
        ))}
      </div>
    </div>
  );
}
