"use client";

import { useState, useEffect } from "react";
import VoiceInput from "@/components/VoiceInput";
import { useClickSound } from "@/components/useClickSound";
import { useTambo } from "@tambo-ai/react";
import Ambient from "@/components/Ambient";

// Import registry to manually render nodes
import { tamboComponents, tamboComponentMap } from "@/tambo/registry";

type GameState = {
  health: number;
  mana: number;
  inventory: string[];
  location: string;

  // 👇 NEW – cinematic metadata from LLM
  meta?: {
    danger?: number;
    mood?: string;
  };
};

export default function Home() {
  const [started, setStarted] = useState(false);

  // TAMBO DRIVEN UI
  const [ui, setUI] = useState<any[]>([]);

  // Core state still kept locally
  const [state, setState] = useState<GameState>({
    health: 100,
    mana: 50,
    inventory: [],
    location: "cell",
    meta: {
      danger: 0,
      mood: "neutral",
    },
  });

  const playClick = useClickSound();
  const tambo = useTambo();

  // ─── DAMAGE SHAKE ─────────────────────────────
  const [hurt, setHurt] = useState(false);

  useEffect(() => {
    if (state.health < 100 || (state.meta?.danger || 0) > 60) {
      setHurt(true);
      const t = setTimeout(() => setHurt(false), 300);
      return () => clearTimeout(t);
    }
  }, [state.health, state.meta?.danger]);

  // ─── ACTION BRIDGE (for data-tambo-action) ─────
  useEffect(() => {
    const handler = (e: any) => {
      const id = e.target?.getAttribute?.("data-tambo-action");
      if (id) {
        choose(id);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

// ─── GENERIC NODE RENDERER (STABLE) ─────────────────────
function renderNode(node: any, key: number) {
  const Comp = tamboComponentMap[node.component];

  if (!Comp) {
    return (
      <div key={key} className="border border-red-500 p-2 text-red-400">
        Missing component: {node.component}
      </div>
    );
  }

  return <Comp key={key} {...node.props} />;
}

  // ─── CALL AI (TAMBO MODE) ──────────────────────
  async function callAI(action: string) {
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        body: JSON.stringify({ action, state }),
      });

      const data = await res.json();

      // 👉 MAIN TAMBO MAGIC
      if (Array.isArray(data?.ui)) {
        setUI(data.ui);
      }

      setState((s) => ({
        ...s,
        ...(data?.state || {}),
      }));
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

  // ─── MAIN TAMBO UI ─────────────────────────────
  return (
    <div
      className={`min-h-screen bg-black text-white p-4 md:p-8 ${
        hurt ? "damage" : ""
      }`}
    >
      {/* 🎧 CINEMATIC SOUND DIRECTOR */}
      <Ambient state={state} />

      {/* 🩸 DANGER OVERLAY */}
      {state.meta?.danger && state.meta.danger > 50 && (
        <div className="fixed inset-0 pointer-events-none bg-red-900/10 animate-pulse" />
      )}

      {/* 🔥 TRUE GENERATIVE UI ZONE */}
      <div className="space-y-4 relative z-10">
        {(ui || []).map((node, i) => renderNode(node, i))}
      </div>

      {/* VOICE STILL WORKS AS GLOBAL INPUT */}
      <div className="mt-4 border-2 border-white p-3">
        <VoiceInput onCommand={choose} />
      </div>

      {/* DEBUG PANEL */}
      <div className="mt-6 border-2 border-yellow-400 p-4 text-xs">
        <div>DEBUG</div>
        <div>Health: {state?.health ?? 0}</div>
        <div>Danger: {state.meta?.danger ?? 0}</div>
        <div>Mood: {state.meta?.mood ?? "none"}</div>
        <div>UI nodes: {(ui || []).length}</div>

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
