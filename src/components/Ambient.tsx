"use client";

import { useEffect, useRef } from "react";
import type { GameState } from "@/game/schema";

type Props = {
  state: GameState;
};

export default function Ambient({ state }: Props) {
  const current = useRef<HTMLAudioElement | null>(null);
  const next = useRef<HTMLAudioElement | null>(null);

  // ─── SOUND PALETTE ───────────────────────────────

  function resolveTrack() {
    const mood = state.meta?.mood || "neutral";
    const danger = state.meta?.danger || 0;
    const loc = state.location;

    // DIRECTOR LOGIC
    if (danger > 70) return "/ambience/combat_high.mp3";
    if (danger > 40) return "/ambience/combat_low.mp3";

    if (mood === "dread") return "/ambience/dread.mp3";
    if (mood === "hope") return "/ambience/hope.mp3";
    if (mood === "tense") return "/ambience/tense.mp3";

    // LOCATION FALLBACKS
    if (loc.includes("cell")) return "/ambience/dungeon.mp3";
    if (loc.includes("catacomb")) return "/ambience/bones.mp3";
    if (loc.includes("armory")) return "/ambience/forge.mp3";

    return "/ambience/deep.mp3";
  }

  // ─── CINEMATIC CROSSFADE ─────────────────────────

  function crossfade(to: HTMLAudioElement) {
    const from = current.current;

    to.volume = 0;
    to.loop = true;

    to.play().catch(() => {});

    const step = () => {
      if (from) {
        from.volume = Math.max(0, from.volume - 0.02);
      }

      to.volume = Math.min(
        0.35 + (state.meta?.danger || 0) * 0.003,
        to.volume + 0.02
      );

      if (to.volume < 0.35) {
        requestAnimationFrame(step);
      } else {
        if (from) from.pause();
        current.current = to;
      }
    };

    requestAnimationFrame(step);
  }

  // ─── REACT TO STATE ──────────────────────────────

  useEffect(() => {
    const track = resolveTrack();

    // Same track → just update intensity
    if (current.current?.src.includes(track)) {
      const danger = state.meta?.danger || 0;
      current.current.volume = 0.25 + danger * 0.002;
      return;
    }

    next.current = new Audio(track);
    crossfade(next.current);

    return () => {
      current.current?.pause();
      next.current?.pause();
    };
  }, [
    state.location,
    state.meta?.mood,
    state.meta?.danger,
  ]);

  return null;
}
