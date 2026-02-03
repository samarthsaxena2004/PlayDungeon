import type { GameState, StoryResponse } from "@/game/schema";

export async function generateStory(
  action: string,
  state: GameState
): Promise<StoryResponse> {

  // REAL AI CALL COMES TOMORROW

  return {
    story: "Demo response",
    state: {},
    choices: [],
  };
}
