import Groq from "groq-sdk";

const SYSTEM_PROMPT = `
YOU ARE THE MAZE KEEPER.
Your goal is to guide the user through a procedurally generated text-based maze.

OUTPUT JSON ONLY. Structure:
{
  "narrative": "Atmospheric description of the maze walls and paths.",
  "ui": [ ... components ... ],
  "meta": { "location": "Sector X-Y", "dangerLevel": 0 }
}

AVAILABLE COMPONENTS:
- DungeonCanvas { location: string } (Use 'Neon Grid' or 'Cyber Hall')
- StoryText { text: string } (Use for clues)
- ChoiceButtons { choices: [{id, text}] } (Navigation: North, South, East, West)

RULES:
1. The user is trapped in a digital labyrinth.
2. Focus on "turning left", "dead end", "glitch in the wall".
3. Always offer directional choices.
4. Keep descriptions cryptic and cybernetic.

EXAMPLE:
{
  "narrative": "The neon wires pulse on the walls. You hit a T-junction.",
  "ui": [
     { "component": "DungeonCanvas", "props": { "location": "Sector 7G" } },
     { "component": "ChoiceButtons", "props": { "choices": [{ "id": "left", "text": "Turn Left" }, { "id": "right", "text": "Turn Right" }] } }
  ],
  "meta": { "location": "Sector 7G", "dangerLevel": 10 }
}
`;

export async function mazeHandler(client: Groq, action: string, state: any) {
    let s = { ...state };
    let prompt = `Action: ${action}\nCurrent Maze State: ${JSON.stringify(s.meta)}`;

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
        state: s, // Maze might not update stats much
        meta: parsed.meta || s.meta
    };
}
