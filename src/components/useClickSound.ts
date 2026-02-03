"use client";

export function useClickSound() {
  return () => {
    try {
      const a = new Audio("/click.mp3");
      a.volume = 0.3;
      a.play();
    } catch {
      // ignore if missing
    }
  };
}
