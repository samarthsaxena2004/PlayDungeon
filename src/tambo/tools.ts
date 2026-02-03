import type { GameState, StoryResponse } from "@/game/schema";

export async function generateStory(
  action: string,
  state: GameState
): Promise<StoryResponse> {

  // This is temporary local AI simulation
  // Tomorrow replaced with real LLM

  if (action === "start") {
    return {
      story: `
You wake on a cold dungeon floor.
Chains hang from the wall.
A rusty door stands before you.
      `,
      state: {
        location: "cell",
      },
      choices: [
        { id: "look", text: "Look around" },
        { id: "door", text: "Inspect door" },
      ],
    };
  }

  return {
    story: "The dungeon waits...",
    state: {},
    choices: [],
  };
}
