import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

  const SYSTEM = `
YOU ARE TAMBO GAME ENGINE – GENERATIVE UI MODE.

You do NOT return plain text stories.
You DESIGN SCREENS using COMPONENTS ONLY.

AVAILABLE COMPONENTS:

1) DungeonCanvas
   props: { location: string }

2) StoryText
   props: { text: string }

3) PlayerStatus
   props: {
     hp: number
     mana: number
     location: string
     inventory: string[]
   }

4) ChoiceButtons
   props: {
     choices: { id: string, text: string }[]
   }

5) InventoryPanel
   props: { items: string[] }

RULES:
- Respond ONLY in JSON
- NEVER include markdown, explanations, or JSX
- Max 5 components per screen
- Design like: 90s dungeon aesthetic + 2026 modern UI
- Keep tension high, risk vs reward
- Reflect combat, loot, mana usage
- Health ≤ 0 should feel lethal

FORMAT REQUIRED:

{
  "ui": [
    { "component": "DungeonCanvas", "props": {...} },
    { "component": "StoryText", "props": {...} },
    { "component": "ChoiceButtons", "props": {...} }
  ],

  "state": {
    "health": number,
    "mana": number,
    "inventory": string[],
    "location": string
  }
}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify({ action, state }) },
      ],
    });

    const raw = completion.choices[0].message.content!;
    console.log("RAW TAMBO UI:", raw);

    // ─── SAFE PARSE ───────────────────────────────
    let parsed: any;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (
      !parsed ||
      !Array.isArray(parsed.ui) ||
      typeof parsed.state !== "object"
    ) {
      throw new Error("Invalid Tambo structure");
    }

    return Response.json(parsed);

  } catch (e) {
    console.error("TAMBO ERROR:", e);

    // ─── FALLBACK GENERATIVE UI ───────────────────
    return Response.json({
      ui: [
        {
          component: "DungeonCanvas",
          props: { location: state?.location || "void" }
        },
        {
          component: "StoryText",
          props: {
            text: "Arcane interference fractures the dungeon weave. Reality resists your command."
          }
        },
        {
          component: "ChoiceButtons",
          props: {
            choices: [
              { id: "retry", text: "Stabilize the weave" }
            ]
          }
        }
      ],
      state: state || {
        health: 100,
        mana: 50,
        inventory: [],
        location: "void"
      }
    });
  }
}
