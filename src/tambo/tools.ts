import type { GameState, StoryResponse } from "@/game/schema";
import { Cerebras } from "@cerebras/cerebras_cloud_sdk";

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY || "",
});

const SYSTEM_PROMPT = `
You are the Dungeon Master for a text RPG.

RULES:
- Always respond ONLY in valid JSON.
- Never break character.
- Keep tone dark fantasy.
- Provide exactly 2-4 choices.
- Track logical state changes.

FORMAT:
{
  "story": string,
  "state": {
    "health": number,
    "mana": number,
    "inventory": string[],
    "location": string
  },
  "choices": [
    { "id": string, "text": string }
  ]
}
`;

export async function generateStory(
  action: string,
  state: GameState
): Promise<StoryResponse> {

  const userPrompt = `
Current State:
${JSON.stringify(state)}

Player Action: ${action}
`;

  const completion = await client.chat.completions.create({
    model: "glm-4.7",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  try {
    const text = completion.choices[0].message.content!;
    return JSON.parse(text) as StoryResponse;
  } catch (err) {
    // Safety fallback
    return {
      story: "The dungeon murmurs in confusion...",
      state,
      choices: [
        { id: "continue", text: "Gather your thoughts" },
      ],
    };
  }
}
