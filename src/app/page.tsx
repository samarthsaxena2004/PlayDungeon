"use client";

import { useTambo } from "@tambo-ai/react";

export default function Home() {
  const { thread, send } = useTambo();

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">

      <h1 className="text-4xl mb-6 border-b pb-2">
        PLAY DUNGEON
      </h1>

      {/* ─── TAMBO THREAD RENDER ─── */}
      <div className="space-y-4">
        {Array.isArray(thread) &&
          thread.map((message: any, i: number) => (
            <div key={i}>
              {/*
                Tambo will automatically render:
                - <StoryText />
                - <PlayerStatus />
                - <ChoiceButtons />
                based on AI instructions
              */}
              {message}
            </div>
          ))}
      </div>

      {/* ─── START BUTTON ─── */}
      <div className="mt-6">
        <button
          onClick={() => send("start")}
          className="border-2 border-white p-3 hover:bg-white hover:text-black"
        >
          START ADVENTURE
        </button>
      </div>
    </div>
  );
}
