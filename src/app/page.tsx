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
  // ─── CORE STATE ───────────────────────────────
  const [started, setStarted] = useState(false);
  const [story, setStory] = useState<string>("");
  const [choices, setChoices] = useState<any[]>([]);
  const [state, setState] = useState<GameState>({
    health: 100,
    mana: 50,
    inventory: [],
    location: "cell",
  });

  const playClick = useClickSound();
  const tambo = useTambo();

  // ─── DAMAGE SHAKE ─────────────────────────────
  const [hurt, setHurt] = useState(false);

  useEffect(() => {
    if (state.health < 100) {
      setHurt(true);
      const t = setTimeout(() => setHurt(false), 300);
      return () => clearTimeout(t);
    }
  }, [state.health]);

  // ─── AI CALL ──────────────────────────────────
  async function callAI(action: string) {
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        body: JSON.stringify({ action, state }),
      });

      const data = await res.json();

      // SAFE ASSIGNMENTS
      setStory(typeof data?.story === "string" ? data.story : "");

      setChoices(Array.isArray(data?.choices) ? data.choices : []);

      setState((s) => ({
        ...s,
        ...(data?.state || {}),
      }));

      // 👉 Parallel Tambo layer (non-blocking)
      if (typeof tambo?.runTool === "function") {
        tambo.runTool("generateStory", { action, state });
      }
    } catch (err) {
      console.error("CLIENT AI ERROR:", err);
    }
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

  // ─── START SCREEN ─────────────────────────────
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

  // ─── MAIN UI ──────────────────────────────────
  return (
    <div
      className={`min-h-screen bg-black text-white p-4 md:p-8 ${
        hurt ? "damage" : ""
      }`}
    >
      {/* ─── STORY ─────────────────────────────── */}
      <div className="border-4 border-white p-6">
        <Typewriter text={story || ""} />
      </div>

      {/* ─── TAMBO GENERATIVE ZONE ─────────────── */}
      <div className="mt-4 border-2 border-dashed border-purple-500 p-3">
        {typeof tambo?.render === "function" && tambo.render()}
      </div>

      {/* ─── CHOICES ───────────────────────────── */}
      <div className="mt-4 space-y-2">
        {(choices || []).map((c) => (
          <button
            key={c?.id}
            onClick={() => choose(c?.id)}
            className="
              block w-full border-2 border-white p-3
              hover:bg-white hover:text-black
              transition-all duration-150
              active:scale-[0.98]
            "
          >
            {c?.text}
          </button>
        ))}
      </div>

      {/* ─── VOICE INPUT ───────────────────────── */}
      <div className="mt-4 border-2 border-white p-3">
        <VoiceInput onCommand={choose} />
      </div>

      {/* ─── PLAYER STATUS ─────────────────────── */}
      <div className="mt-6 border-2 border-white p-4 text-sm space-y-1">
        <div>HP: {state.health}</div>
        <div>Mana: {state.mana}</div>
        <div>Location: {state.location}</div>

        <div>
          Inventory:{" "}
          {state.inventory?.length > 0
            ? state.inventory.join(", ")
            : "Empty"}
        </div>
      </div>

      {/* ─── DEBUG PANEL ───────────────────────── */}
      <div className="mt-6 border-2 border-yellow-400 p-4 text-xs">
        <div>DEBUG</div>
        <div>Health: {state?.health ?? 0}</div>
        <div>Choices count: {(choices || []).length}</div>
        <div>Story length: {(story || "").length}</div>

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
