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

🚨 CRITICAL:
- You must return ONLY valid JSON
- NEVER return JSX, HTML, or components
- NEVER include <StoryText> or any tags
- NO markdown
- NO explanations

FORMAT REQUIRED:

{
  "story": "narrative text",
  "state": {
    "health": number,
    "mana": number,
    "inventory": string[],
    "location": string
  },
  "choices": [
    { "id": "string", "text": "string" }
  ]
}

MECHANICS:
- Enemies deal 5–20 damage
- Healing potions restore 15 HP
- Mana spells cost 10 mana
- If health ≤ 0 → game over

RULES:
- Never repeat same narration
- Keep tension high
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

    // ─── SAFE PARSE ───────────────────────────────
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // Attempt to extract JSON if model wrapped it
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed) throw new Error("Invalid JSON from LLM");

    return Response.json(parsed);

  } catch (err) {
    console.error("GROQ ERROR:", err);

    return Response.json({
      story: "Arcane energies distort reality. The dungeon shudders.",
      state,
      choices: [{ id: "retry", text: "Regain focus" }],
    });
  }
}
