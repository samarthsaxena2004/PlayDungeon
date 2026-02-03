import { NextRequest } from "next/server";
import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import type { GameState } from "@/game/schema";

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

  const SYSTEM_PROMPT = `
You are the Dungeon Master for a text RPG.
Always respond ONLY in valid JSON.

FORMAT:
{
  "story": string,
  "state": { "health": number, "mana": number, "inventory": string[], "location": string },
  "choices": [{ "id": string, "text": string }]
}
`;

  const completion = await client.chat.completions.create({
    model: "glm-4.7",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ action, state }) },
    ],
  });

  return Response.json(
    JSON.parse(completion.choices[0].message.content!)
  );
}
