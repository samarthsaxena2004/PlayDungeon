import Groq from "groq-sdk";

const SYSTEM_PROMPT = `
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
- HeroCard { health, maxHealth, mana, maxMana } (ALWAYS USE THIS for player stats)
- EnemyDisplay { name: string, hp, maxHp, status } (Use this for enemies/combat)
- InventoryPanel { inventory: [] }
- StoryText (Use sparingly, prefer 'narrative' field for text)

RULES:
1. "narrative" is for the scrolling chat. It should be atmospheric.
2. "ui" replaces the ENTIRE canvas content. Always return the full scene you want visible.
3. START EVERY SCENE with HeroCard (unless dead).
4. If in combat, use EnemyDisplay.
5. If exploring, always include DungeonCanvas as the background.
6. Always provide ChoiceButtons at the end of the UI list.

EXAMPLE:
{
  "narrative": "A goblin leaps from the shadows!",
  "ui": [
    { "component": "DungeonCanvas", "props": { "location": "Dark Tunnel" } },
    { "component": "HeroCard", "props": { "health": 95, "maxHealth": 100, "mana": 30, "maxMana": 50 } },
    { "component": "EnemyDisplay", "props": { "name": "Goblin Scavenger", "hp": 30, "maxHp": 30, "status": "Aggressive" } },
    { "component": "ChoiceButtons", "props": { "choices": [{ "id": "atk", "text": "Attack" }] } }
  ],
  "state": { "stats": { "health": 95 } },
  "meta": { "location": "Dark Tunnel", "dangerLevel": 80, "mood": "tense" }
}
`;

export async function dungeonHandler(client: Groq, action: string, state: any) {
    let s = { ...state };
    let prompt = `Action: ${action}\nCurrent State: ${JSON.stringify(s)}`;

    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        stop: ["\n\n"],
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
        ],
    });

    const raw = completion.choices[0].message.content!;
    // console.log("DUNGEON AI:", raw);

    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Merge state updates logic specific to Dungeon (if any)
    const finalState = { ...s, ...parsed.state };

    return {
        narrative: parsed.narrative,
        ui: parsed.ui || [],
        state: finalState,
        meta: parsed.meta || s.meta
    };
}
