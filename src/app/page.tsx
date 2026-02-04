"use client";

import { useEffect } from "react";
import { ChatInterface } from "@/components/layout/ChatInterface";
import { GenerativeCanvas } from "@/components/layout/GenerativeCanvas";
import { useGameStore } from "@/game/store";
import { useClickSound } from "@/components/useClickSound";

export default function Home() {
  const { meta, updateStats, updateMeta, setScene, setThinking, addMessage } = useGameStore();
  const playClick = useClickSound();

  // ─── INITIALIZATION ─────────────────────────────
  useEffect(() => {
    // Initial scene setup (simulation of what API would return)
    setScene([
      { component: "DungeonCanvas", props: { location: "Entrance Hall" } },
      { component: "StoryText", props: { text: "The heavy iron doors slam shut behind you. There is no turning back." } },
      { component: "ChoiceButtons", props: { choices: [{ id: "look", text: "Look Around" }, { id: "inv", text: "Check Inventory" }] } }
    ]);
  }, []);

  // ─── ACTION HANDLER ────────────────────────────
  // This will eventually be moved or triggered by the ChatInterface/VoiceInput
  async function handleAction(action: string) {
    playClick();
    setThinking(true);

    // Optimistic UI update
    addMessage({ role: "user", content: action });

    try {
      // Mock API latency
      await new Promise(r => setTimeout(r, 1200));

      // Mock Response (Replace with real API call later)
      addMessage({ role: "assistant", content: `You ${action}. The dungeon echoes with your movement.` });

      // Mock Scene Update
      setScene([
        { component: "DungeonCanvas", props: { location: "Deeper Hallway" } },
        { component: "StoryText", props: { text: `You move forward. The shadows lengthen. Danger increases.` } },
        { component: "ChoiceButtons", props: { choices: [{ id: "atk", text: "Draw Weapon" }, { id: "hide", text: "Hide" }] } }
      ]);

      updateMeta({ dangerLevel: Math.min(meta.dangerLevel + 10, 100) });

    } catch (err) {
      console.error(err);
    } finally {
      setThinking(false);
    }
  }

  // Global click handler to capture interactions from the generative UI
  useEffect(() => {
    const handler = (e: any) => {
      const id = e.target?.getAttribute?.("data-tambo-action");
      if (id) {
        handleAction(id);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [meta]); // Re-bind if meta changes, though typically not needed if handler is stable

  return (
    <main className="flex h-screen w-full bg-black text-white relative overflow-hidden font-sans selection:bg-purple-500/30">

      {/* ─── LEFT PANEL: CHAT & NARRATIVE ────────── */}
      <section className="w-[400px] flex-shrink-0 relative z-20 shadow-2xl">
        <ChatInterface />
      </section>

      {/* ─── RIGHT PANEL: GENERATIVE CANVAS ──────── */}
      <section className="flex-1 relative z-10 bg-[#050505]">
        <GenerativeCanvas />
      </section>

      {/* ─── GLOBAL OVERLAYS ─────────────────────── */}
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none scanline z-50 opacity-20 mix-blend-overlay" />

      {/* Global Damage Vfx */}
      {meta.dangerLevel > 80 && (
        <div className="fixed inset-0 pointer-events-none bg-red-900/10 animate-pulse z-40" />
      )}

    </main>
  );
}

