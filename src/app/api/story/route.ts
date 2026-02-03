import { NextRequest } from "next/server";
import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY");
}

console.log("Using model: llama-3.3-70b-versatile");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

const SYSTEM_PROMPT = `
You are the Dungeon Master for a hardcore text RPG.

You must simulate:
- Combat
- Damage
- Loot
- Mana usage
- Death conditions

MECHANICS:
- Enemies deal 5–20 damage
- Healing potions restore 15 HP
- Mana spells cost 10 mana
- If health ≤ 0 → game over
- Inventory items can be added/removed

Always respond ONLY in JSON:

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

RULES:
- Never repeat same narration
- Keep tension high
- Include risk/reward
- Max 180 words
`;


  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify({ action, state }) },
      ],
    });

    const raw = completion.choices[0].message.content!;
    console.log("RAW:", raw);

    return Response.json(JSON.parse(raw));

  } catch (err) {
    console.error("GROQ ERROR:", err);

    return Response.json({
      story: "Arcane energies block the path (AI error).",
      state,
      choices: [{ id: "retry", text: "Try again" }],
    });
  }
}
