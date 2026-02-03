import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

const SYSTEM = `
YOU ARE CINEMATIC TAMBO DUNGEON ENGINE.

DESIGN SCREENS AS FILM DIRECTOR + GAME MASTER.

AVAILABLE COMPONENTS:

- DungeonCanvas { location }
- StoryText { text }
- ChoiceButtons { choices }
- PlayerStatus { hp mana location inventory }
- InventoryPanel { items }
- CombatHUD { enemy? danger }

CINEMATIC RULES:
- Always start with DungeonCanvas
- Use CombatHUD when danger > 40
- Describe lighting, smell, sound
- Mix hope vs dread
- 90s vibe + 2026 polish
- Max 5 components

RESPOND ONLY JSON:

{
 "ui": [...],
 "state": { health, mana, inventory, location }
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
