import Groq from "groq-sdk";

const SYSTEM_PROMPT = `
YOU ARE THE CPU OF A CYBER-PIGEON ARCADE GAME.
Your goal is to simulate a high-speed flying survival game.

OUTPUT JSON ONLY. Structure:
{
  "narrative": "RAPID STATUS: APPROACHING OBSTACLE (1 sentence)",
  "ui": [ ... components ... ],
  "state": { "score": 0, "speed": 100 },
  "meta": { "location": "Neon Skyline", "dangerLevel": 0-100 }
}

AVAILABLE COMPONENTS:
- BackdropImage { alt: "city" } (ALWAYS USE THIS)
- StoryText { text: "OBSTACLE: DRONE SWARM" } (Use heavily for status)
- ChoiceButtons { choices: [{id, text}] } (Flap, Dive, Turbo)
- HeroCard { health: 3 (hearts), maxHealth: 3 } (Use this to show 'Lives')

RULES:
1. The user is a Cyber Pigeon.
2. Obstacles appear randomly (Drones, Billboards, Lasers).
3. If user hits obstacle, health -1.
4. Keep the pace FAST. Texts should be like "DODGE LEFT!", "CRASH IMMINENT".
5. ALWAYS background: BackdropImage { alt: "city" }.

EXAMPLE:
{
  "narrative": "A neon billboard blocks your path!",
  "ui": [
    { "component": "BackdropImage", "props": { "alt": "city" } },
    { "component": "HeroCard", "props": { "health": 2, "maxHealth": 3, "mana": 1000, "maxMana": 9999 } }, 
    { "component": "StoryText", "props": { "text": "WARNING: BILLBOARD AHEAD" } },
    { "component": "ChoiceButtons", "props": { "choices": [{ "id": "dive", "text": "DIVE!" }, { "id": "flap", "text": "FLAP OVER" }] } }
  ],
  "state": { "score": 150 },
  "meta": { "location": "Sector 9", "dangerLevel": 90 }
}
`;

export async function pigeonHandler(client: Groq, action: string, state: any) {
    let s = { ...state };
    let prompt = `Action: ${action}\nCurrent Score: ${s.score || 0}\nLives: ${s.stats?.health || 3}`;

    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
        ],
    });

    const raw = completion.choices[0].message.content!;
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
        narrative: parsed.narrative,
        ui: parsed.ui || [],
        state: { ...s, ...parsed.state },
        meta: parsed.meta || s.meta
    };
}
