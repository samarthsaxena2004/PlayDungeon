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

    // 1. Optimistic Update
    addMessage({ role: "user", content: action });

    try {
      const currentState = useGameStore.getState();

      const res = await fetch("/api/story", {
        method: "POST",
        body: JSON.stringify({
          action,
          state: {
            stats: currentState.stats,
            inventory: currentState.inventory,
            meta: currentState.meta
          }
        }),
      });

      if (!res.ok) throw new Error("API Failed");

      const data = await res.json();

      // 2. Handle Response
      if (data.narrative) {
        addMessage({ role: "assistant", content: data.narrative });
      }

      if (data.ui) {
        setScene(data.ui);
      }

      if (data.state) {
        // Merge returned state into our store
        if (data.state.stats) updateStats(data.state.stats);
        if (data.state.inventory) currentState.inventory = data.state.inventory; // Direct mutation warning: better to have setInventory
        if (data.state.meta) updateMeta(data.state.meta);
      }

      if (data.meta) {
        updateMeta(data.meta);
      }

    } catch (err) {
      console.error(err);
      addMessage({ role: "system", content: "The connection to the ethereal plane was lost." });
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
        <ChatInterface onAction={handleAction} />
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

