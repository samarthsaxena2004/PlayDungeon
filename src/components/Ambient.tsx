"use client";

import { useEffect } from "react";

export default function Ambient({ location }: { location: string }) {
  useEffect(() => {
    const audio = new Audio(
      location.includes("cell")
        ? "/ambience/dungeon.mp3"
        : "/ambience/deep.mp3"
    );

    audio.loop = true;
    audio.volume = 0.25;

    audio.play().catch(() => {});
    return () => audio.pause();
  }, [location]);

  return null;
}
