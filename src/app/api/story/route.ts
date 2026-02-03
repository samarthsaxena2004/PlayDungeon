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
You are a Dungeon Master that controls UI via Tambo.

You MUST respond ONLY with Tambo component calls.

EXAMPLE RESPONSE:

<StoryText text="You stand in a cell" />

<PlayerStatus
  hp={100}
  mana={50}
  location="cell"
  inventory={["torch"]}
/>

<ChoiceButtons
  choices={[
    {id:"look", text:"Look around"},
    {id:"door", text:"Open door"}
  ]}
/>

RULES:
- Always include StoryText
- Always include PlayerStatus
- Always include ChoiceButtons
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
