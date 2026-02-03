"use client";

import { useTambo } from "@tambo-ai/react";

export default function Home() {
  const tambo = useTambo();

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-4">PLAY DUNGEON</h1>

      {/* TAMBO RENDER ZONE */}
      <div>{tambo.render()}</div>

      {/* START */}
      <button
        onClick={() =>
          tambo.send("start game")
        }
        className="mt-4 border-2 p-3"
      >
        START
      </button>

    </div>
  );
}
