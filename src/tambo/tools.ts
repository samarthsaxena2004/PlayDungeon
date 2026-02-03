import type { GameState } from "@/game/schema";

export async function generateStory({
  action,
  state,
}: {
  action: string;
  state: GameState;
}) {
  const res = await fetch("/api/story", {
    method: "POST",
    body: JSON.stringify({ action, state }),
  });

  return res.json();
}

generateStory.tambo = {
  name: "generateStory",
  description: "Main game engine",
};
