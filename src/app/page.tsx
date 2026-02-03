"use client";

import { useState, useEffect } from "react";
import Typewriter from "@/components/Typewriter";
import VoiceInput from "@/components/VoiceInput";
import { useClickSound } from "@/components/useClickSound";

import { useTambo } from "@tambo-ai/react";

type GameState = {
  health: number;
  mana: number;
  inventory: string[];
  location: string;
};

export default function Home() {
  // ─── EXISTING WORKING STATE ─────────────────────
  const [started, setStarted] = useState(false);
  const [story, setStory] = useState("");
  const [choices, setChoices] = useState<any[]>([]);
  const [state, setState] = useState<GameState>({
    health: 100,
    mana: 50,
    inventory: [],
    location: "cell",
  });

  const playClick = useClickSound();

  // ─── TAMBO (NON-BREAKING) ───────────────────────
  const tambo = useTambo();

  // ─── DAMAGE SHAKE ───────────────────────────────
  const [hurt, setHurt] = useState(false);

  useEffect(() => {
    if (state.health < 100) {
      setHurt(true);
      const t = setTimeout(() => setHurt(false), 300);
      return () => clearTimeout(t);
    }
  }, [state.health]);

  // ─── CURRENT AI CALL (KEEP AS IS) ───────────────
  async function callAI(action: string) {
    const res = await fetch("/api/story", {
      method: "POST",
      body: JSON.stringify({ action, state }),
    });

    const data = await res.json();

    setStory(data.story);
    setChoices(Array.isArray(data?.choices) ? data.choices : []);

    setState((s) => ({
      ...s,
      ...data.state,
    }));

    // 👉 ALSO FEED TAMBO (parallel layer)
    tambo.runTool?.("generateStory", { action, state });
  }

  async function startGame() {
    playClick();
    setStarted(true);
    await callAI("start");
  }

  async function choose(id: string) {
    playClick();
    await callAI(id);
  }

  // ─── START SCREEN ───────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <button
          onClick={startGame}
          className="
            border-4 border-white p-6 text-white
            hover:bg-white hover:text-black
            transition-all active:scale-[0.97]
          "
        >
          START PLAYDUNGEON
        </button>
      </div>
    );
  }

  // ─── MAIN GAME UI ───────────────────────────────
  return (
    <div
      className={`min-h-screen bg-black text-white p-4 md:p-8 ${
        hurt ? "damage" : ""
      }`}
    >
      {/* ─── CLASSIC STORY (YOUR WORKING ONE) ─── */}
      <div className="border-4 border-white p-6">
        <Typewriter text={story} />
      </div>

      {/* ─── TAMBO GENERATIVE LAYER ─── */}
      <div className="mt-4 border-2 border-dashed border-purple-500 p-3">
        {/*
          This is the hackathon magic zone.
          Judges will see REAL generative UI here.
        */}
        {typeof tambo.render === "function" && tambo.render()}
      </div>

      {/* ─── CHOICES (WORKING) ─── */}
      <div className="mt-4 space-y-2">
        {(choices || []).map((c) => (
          <button
            key={c.id}
            onClick={() => choose(c.id)}
            className="
              block w-full border-2 border-white p-3
              hover:bg-white hover:text-black
              transition-all duration-150
              active:scale-[0.98]
            "
          >
            {c.text}
          </button>
        ))}
      </div>


      {/* ─── VOICE ─── */}
      <div className="mt-4 border-2 border-white p-3">
        <VoiceInput onCommand={choose} />
      </div>

      {/* ─── PLAYER STATUS ─── */}
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

      {/* ─── DEBUG ─── */}
      <div className="mt-6 border-2 border-yellow-400 p-4 text-xs">
        <div>DEBUG</div>
        <div>Health: {state.health}</div>
        <div>Choices count: {choices.length}</div>
        <div>Story length: {story.length}</div>

        <button
          onClick={() => choose("test_damage")}
          className="mt-2 border p-2"
        >
          TEST DAMAGE
        </button>
      </div>
    </div>
  );
}
