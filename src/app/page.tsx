"use client";

import { useState } from "react";
import Typewriter from "@/components/Typewriter";


type GameState = {
  health: number;
  mana: number;
  inventory: string[];
  location: string;
};

export default function Home() {
  const [started, setStarted] = useState(false);
  const [story, setStory] = useState("");
  const [choices, setChoices] = useState<any[]>([]);
  const [state, setState] = useState<GameState>({
    health: 100,
    mana: 50,
    inventory: [],
    location: "cell",
  });

  async function callAI(action: string) {
    const res = await fetch("/api/story", {
      method: "POST",
      body: JSON.stringify({ action, state }),
    });

    const data = await res.json();

    setStory(data.story);
    setChoices(data.choices);

    setState((s) => ({
      ...s,
      ...data.state,
    }));
  }

  async function startGame() {
    setStarted(true);
    await callAI("start");
  }

  async function choose(id: string) {
    await callAI(id);
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

      {/* STORY */}
      <div className="border-4 border-white p-6">
        <Typewriter text={story} />
      </div>

      {/* CHOICES */}
      <div className="mt-4 space-y-2">
        {choices.map((c) => (
          <button
            key={c.id}
            onClick={() => choose(c.id)}
            className="block w-full border-2 border-white p-3 hover:bg-white hover:text-black"
          >
            {c.text}
          </button>
        ))}
      </div>

      {/* PLAYER STATUS */}
      <div className="mt-6 border-2 border-white p-4 text-sm space-y-1">
        <div>HP: {state.health}</div>
        <div>Mana: {state.mana}</div>
        <div>Location: {state.location}</div>

        <div>
          Inventory:{" "}
          {state.inventory.length > 0
            ? state.inventory.join(", ")
            : "Empty"}
        </div>
      </div>

    </div>
  );
}
