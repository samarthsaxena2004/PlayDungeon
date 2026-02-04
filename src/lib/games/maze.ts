import Groq from "groq-sdk";

const SYSTEM_PROMPT = `
YOU ARE THE MAZE KEEPER.
Your goal is to guide the user through a procedurally generated text-based maze in a CYBERPUNK NETWORK.

OUTPUT JSON ONLY. Structure:
{
  "narrative": "Cryptic technical description of the network node.",
  "meta": { "location": "Sector X-Y", "dangerLevel": 0 }
}

RULES:
1. The user is a packet/hacker trapped in a local network.
2. Focus on "turning left", "dead end", "firewall ahead", "data corruption".
3. Always offer directional choices in the narrative (e.g. "Paths detected: NORTH, EAST").
4. Keep descriptions cryptic, uppercase, and technical.

EXAMPLE:
{
  "narrative": "NODE 74-B REACHED. DATA INTEGRITY 98%. PATHWAYS DETECTED: [NORTH] [WEST]. WARNING: FIREWALL ACTIVITY.",
  "meta": { "location": "Node 74-B", "dangerLevel": 25 }
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
