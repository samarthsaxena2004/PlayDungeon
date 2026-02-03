"use client";

import { useState } from "react";

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

  // ─────────────────────────────────────────────
  // Call AI backend
  // ─────────────────────────────────────────────
  async function callAI(action: string) {
    const res = await fetch("/api/story", {
      method: "POST",
      body: JSON.stringify({ action, state }),
    });

    const data = await res.json();

    setStory(data.story);
    setChoices(data.choices);

    // merge new state from AI
    setState((s) => ({
      ...s,
      ...data.state,
    }));
  }

  // ─────────────────────────────────────────────
  // Start game
  // ─────────────────────────────────────────────
  async function startGame() {
    setStarted(true);
    await callAI("start");
  }

  // ─────────────────────────────────────────────
  // Player chooses option
  // ─────────────────────────────────────────────
  async function choose(id: string) {
    await callAI(id);
  }

  // ─────────────────────────────────────────────
  // DEATH SCREEN
  // ─────────────────────────────────────────────
  if (started && state.health <= 0) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-8 text-center">
        <h1 className="text-4xl mb-4">YOU DIED</h1>

        <pre className="text-white mb-6 whitespace-pre-wrap">
          {story}
        </pre>

        <button
          onClick={() => window.location.reload()}
          className="border-2 border-red-500 p-4 hover:bg-red-500 hover:text-black"
        >
          RESTART RUN
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // START SCREEN
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // MAIN GAME UI
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">

      {/* STORY */}
      <div className="border-4 border-white p-6">
        <pre className="whitespace-pre-wrap font-mono">
          {story}
        </pre>
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
          Inventory: {state.inventory.length > 0
            ? state.inventory.join(", ")
            : "Empty"}
        </div>
      </div>

    </div>
  );
}
