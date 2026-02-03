"use client";

export function useClickSound() {
  const play = () => {
    const audio = new Audio("/click.mp3");
    audio.volume = 0.4;
    audio.play();
  };

  return play;
}
