import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

  const SYSTEM = `
YOU ARE TAMBO GAME ENGINE.

You do NOT return text UI.
You DESIGN INTERFACES using these components ONLY:

AVAILABLE COMPONENTS:

1) DungeonCanvas { location: string }

2) StoryText { text: string }

3) PlayerStatus {
   hp: number
   mana: number
   location: string
   inventory: string[]
}

4) ChoiceButtons {
   choices: { id: string, text: string }[]
}

5) InventoryPanel { items: string[] }

RULES:
- Respond ONLY in JSON
- You are free to design layouts per scene
- Make it feel like 90s dungeon + 2026 UI
- Keep high tension
- Include risk/reward
- Max 5 components per screen

FORMAT:

{
  "ui": [
    { "component": "DungeonCanvas", "props": {...} },
    { "component": "StoryText", "props": {...} },
    ...
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
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify({ action, state }) },
      ],
    });

    const raw = completion.choices[0].message.content!;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed) throw new Error("Invalid");

    return Response.json(parsed);

  } catch (e) {
    return Response.json({
      ui: [
        {
          component: "StoryText",
          props: { text: "Reality glitches… try again." }
        }
      ],
      state
    });
  }
}
