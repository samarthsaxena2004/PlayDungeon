import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function roll(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SYSTEM = `
YOU ARE A DUNGEON MASTER AI.
Your goal is to drive a SPLIT-SCREEN RPG.

OUTPUT JSON ONLY. Structure:
{
  "narrative": "The text that appears in the chat log (1-2 sentences max).",
  "ui": [ ... array of component nodes to show on the canvas ... ],
  "state": { ... game state updates ... },
  "meta": { "location": "...", "dangerLevel": 0-100, "mood": "..." }
}

AVAILABLE COMPONENTS (for "ui"):
- DungeonCanvas { location: string }
- ChoiceButtons { choices: [{id, text}] }
- PlayerStatus { health, mana, maxHealth, maxMana }
- InventoryPanel { inventory: [] }
- CombatHUD { enemy, hp, maxHp, status }
- StoryText (Use sparingly, prefer 'narrative' field for text)

RULES:
1. "narrative" is for the scrolling chat. It should be atmospheric.
2. "ui" replaces the ENTIRE canvas content. Always return the full scene you want visible.
3. If entering combat, include CombatHUD.
4. If exploring, always include DungeonCanvas as the background.
5. Always provide ChoiceButtons at the end of the UI list.

EXAMPLE:
{
  "narrative": "A goblin leaps from the shadows!",
  "ui": [
    { "component": "DungeonCanvas", "props": { "location": "Dark Tunnel" } },
    { "component": "CombatHUD", "props": { "enemy": "Goblin Scavenger", "hp": 30, "maxHp": 30 } },
    { "component": "ChoiceButtons", "props": { "choices": [{ "id": "atk", "text": "Attack" }] } }
  ],
  "state": { "health": 95 },
  "meta": { "location": "Dark Tunnel", "dangerLevel": 80, "mood": "tense" }
}
`;

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

  let s = { ...state };
  let prompt = `Action: ${action}\nCurrent State: ${JSON.stringify(s)}`;

  // ─── HARD CODED COMBAT MECHANICS (OPTIONAL HYBRID) ────────
  // We can still inject deterministic logic here if needed, but for now 
  // we will trust the AI to hallucinate the initial state, 
  // and we can sanitize it or apply rules in a middleware layer later.

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      stop: ["\n\n"], // Prevent markdown runoff
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0].message.content!;
    console.log("AI RAW:", raw);

    let parsed;
    try {
      // Attempt to clean markdown code blocks if present
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error("JSON PARSE ERROR", e);
      throw new Error("Failed to parse AI response");
    }

    // Merge state updates
    const finalState = { ...s, ...parsed.state };

    // Ensure meta is preserved if not returned
    const finalMeta = parsed.meta || s.meta;

    return Response.json({
      narrative: parsed.narrative,
      ui: parsed.ui || [],
      state: finalState,
      meta: finalMeta
    });

  } catch (err) {
    console.error("API ERROR:", err);
    return Response.json({
      narrative: "The connection to the dungeon wavers... (AI Error)",
      ui: [
        { component: "DungeonCanvas", props: { location: "Void" } },
        { component: "ChoiceButtons", props: { choices: [{ id: "retry", text: "Try Again" }] } }
      ],
      state: s,
    }, { status: 500 });
  }
}
