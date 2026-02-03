import type { GameState, StoryResponse } from "@/game/schema";

export async function generateStory(
  action: string,
  state: GameState
): Promise<StoryResponse> {

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

  if (action === "look") {
    return {
      story: `
The walls are damp. One stone looks loose.
The door bears strange runes.
      `,
      state: {},
      choices: [
        { id: "stone", text: "Pull loose stone" },
        { id: "runes", text: "Touch runes" },
      ],
    };
  }

  return {
    story: "The dungeon waits...",
    state: {},
    choices: [],
  };
}
