import type { GameState, StoryResponse } from "@/game/schema";

export async function generateStory(
  action: string,
  state: GameState
): Promise<StoryResponse> {

  const res = await fetch("/api/story", {
    method: "POST",
    body: JSON.stringify({ action, state }),
  });

  return res.json();
}
