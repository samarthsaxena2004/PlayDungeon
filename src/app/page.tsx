"use client";

import { useEffect } from "react";
import { ChatInterface } from "@/components/layout/ChatInterface";
import { GenerativeCanvas } from "@/components/layout/GenerativeCanvas";
import { useGameStore } from "@/game/store";
import { useClickSound } from "@/components/useClickSound";
import { MainMenu } from "@/components/MainMenu";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const {
    meta, activeGame, updateStats, updateMeta, setScene,
    setThinking, addMessage, setActiveGame
  } = useGameStore();

  const playClick = useClickSound();

  // ─── STARTUP / RESET ─────────────────────────────
  useEffect(() => {
    // When a game starts, we might want to reset the scene or load initial state
    if (activeGame === 'dungeon') {
      setScene([
        { component: "DungeonCanvas", props: { location: "Entrance Hall" } },
        { component: "StoryText", props: { text: "The heavy iron doors slam shut behind you." } },
        { component: "HeroCard", props: { health: 100, maxHealth: 100, mana: 50, maxMana: 50 } },
        { component: "ChoiceButtons", props: { choices: [{ id: "look", text: "Look Around" }, { id: "back", text: "Leave" }] } }
      ]);
      addMessage({ role: "system", content: "Welcome to Deep Dungeon." });
    }
    // We can add other init logic for 'maze' etc later
  }, [activeGame]);


  // ─── ACTION HANDLER ────────────────────────────
  async function handleAction(action: string) {
    if (action === "back") {
      setActiveGame(null); // Quit to menu
      return;
    }

    playClick();
    setThinking(true);
    addMessage({ role: "user", content: action });

    try {
      const currentState = useGameStore.getState();

      const res = await fetch("/api/story", {
        method: "POST",
        body: JSON.stringify({
          gameId: activeGame, // Pass the ID so API knows which brain to use
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

      if (data.narrative) addMessage({ role: "assistant", content: data.narrative });
      if (data.ui) setScene(data.ui);
      if (data.state) {
        if (data.state.stats) updateStats(data.state.stats);
        if (data.state.inventory) currentState.inventory = data.state.inventory;
        if (data.state.meta) updateMeta(data.state.meta);
      }
      if (data.meta) updateMeta(data.meta);

    } catch (err) {
      console.error(err);
      addMessage({ role: "system", content: "Connection lost." });
    } finally {
      setThinking(false);
    }
  }

  // Global click handler
  useEffect(() => {
    const handler = (e: any) => {
      const id = e.target?.getAttribute?.("data-tambo-action");
      if (id) handleAction(id);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [meta, activeGame]);

  // ─── RENDER ──────────────────────────────────────

  if (!activeGame) {
    return <MainMenu />;
  }

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
      <div className="fixed inset-0 pointer-events-none scanline z-50 opacity-20 mix-blend-overlay" />

      {meta.dangerLevel > 80 && (
        <div className="fixed inset-0 pointer-events-none bg-red-900/10 animate-pulse z-40" />
      )}

      {/* Quit Button (Secret) */}
      <button
        onClick={() => setActiveGame(null)}
        className="fixed top-4 right-4 z-[60] text-xs text-zinc-800 hover:text-white transition-colors"
      >
        EXIT CART
      </button>

    </main>
  );
}
