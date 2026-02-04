"use client";

import { useGameStore } from "@/game/store";
import { MainMenu } from "@/components/MainMenu";
import DungeonGame from "@/games/dungeon/Game";
import NeuralMazeGame from "@/games/maze/Game";

export default function Home() {
  const { activeGame } = useGameStore();

  if (!activeGame) return <MainMenu />;

  if (activeGame === 'dungeon') {
    return <DungeonGame />;
  }

  if (activeGame === 'maze') {
    return <NeuralMazeGame />;
  }

  if (activeGame === 'pigeon') {
    return <div className="h-screen flex items-center justify-center bg-purple-900 text-white">CYBER PIGEON - Coming Soon</div>;
  }

  if (activeGame === 'piggy') {
    return <div className="h-screen flex items-center justify-center bg-green-900 text-white">SHADOW PIGGY - Coming Soon</div>;
  }

  return <MainMenu />;
}
