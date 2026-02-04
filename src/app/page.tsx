"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/layout/ChatInterface";
import { GenerativeCanvas } from "@/components/layout/GenerativeCanvas";
import { useGameStore } from "@/game/store";
import { useClickSound } from "@/components/useClickSound";
import { MainMenu } from "@/components/MainMenu";
import { SystemMenu } from "@/components/SystemMenu";
import { useInputManager } from "@/game/useInputManager";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const {
    meta, activeGame, updateStats, updateMeta, setScene,
    setThinking, addMessage, setActiveGame
  } = useGameStore();

  const playClick = useClickSound();
  const [isChatOpen, setIsChatOpen] = useState(false); // Default closed for immersion? Or maybe open initially.

  // Auto-open chat on new game, but allow toggling
  useEffect(() => {
    if (activeGame) setIsChatOpen(true);
  }, [activeGame]);

  // ─── STARTUP / RESET ─────────────────────────────
  useEffect(() => {
    if (activeGame === 'dungeon') {
      setScene([
        { component: "BackdropImage", props: { alt: "hallway" } }, // Default bg
        { component: "DungeonCanvas", props: { location: "Entrance Hall" } },
        { component: "StoryText", props: { text: "The heavy iron doors slam shut behind you." } },
        { component: "HeroCard", props: { health: 100, maxHealth: 100, mana: 50, maxMana: 50 } },
        { component: "ChoiceButtons", props: { choices: [{ id: "look", text: "Look Around" }, { id: "back", text: "Leave" }] } }
      ]);
      addMessage({ role: "system", content: "Welcome to Deep Dungeon." });
    }
  }, [activeGame]);


  // ─── ACTION HANDLER ────────────────────────────
  async function handleAction(action: string) {
    if (action === "back") {
      setActiveGame(null);
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
          gameId: activeGame,
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

  // ─── INPUT HOOK ────────────────────────────────
  useInputManager(handleAction);

  // Global click handler (retained for UI interactions)
  useEffect(() => {
    const handler = (e: any) => {
      const id = e.target?.getAttribute?.("data-tambo-action");
      if (id) handleAction(id);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [meta, activeGame]);


  if (!activeGame) return <MainMenu />;

  return (
    <main className="relative h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-purple-500/30">

      {/* ─── LAYER 1: IMMERSIVE CANVAS (FULL SCREEN) ─── */}
      <section className="absolute inset-0 z-0">
        <GenerativeCanvas />
      </section>

      {/* ─── LAYER 2: CHAT OVERLAY (LEFT) ──────────── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.section
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 bottom-0 w-[400px] z-20 shadow-2xl bg-black/80 backdrop-blur-md border-r border-white/10"
          >
            <ChatInterface onAction={handleAction} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── LAYER 3: SYSTEM HUD (RIGHT) ───────────── */}
      <SystemMenu
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onExit={() => setActiveGame(null)}
      />

      {/* ─── LAYER 4: GLOBAL FX ────────────────────── */}
      <div className="fixed inset-0 pointer-events-none scanline z-50 opacity-10 mix-blend-overlay" />

      {meta.dangerLevel > 80 && (
        <div className="fixed inset-0 pointer-events-none bg-red-900/10 animate-pulse z-40" />
      )}

    </main>
  );
}
