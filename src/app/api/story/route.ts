import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { context, health, recentEvents, level, playerName } = await req.json();

    const systemPrompt = `You are the Dungeon Master (DM) for a dark fantasy RPG called 'Deep Dungeon'. 
    The player${playerName ? ` named ${playerName}` : ''} is exploring a procedurally generated dungeon.
    Your goal is to provide a brief, atmospheric, and immersive narration based on the game events.
    Keep it short (1-2 sentences). Be descriptive but concise. Use a dark, mysterious tone.
    Current Level: ${level || 1}
    Player Health: ${health}%
    `;

    const userPrompt = `
    Context: ${context}
    Recent Events: ${recentEvents ? recentEvents.join(', ') : 'None'}
    
    Narrate what happens next or describe the atmosphere.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const story = chatCompletion.choices[0]?.message?.content || "The dungeon shadows shift uneasily...";

    return Response.json({ story });
  } catch (error: any) {
    console.error('[v0] Story generation error:', error);
    // Fallback if API fails - INCLUDING ERROR FOR DEBUGGING
    return Response.json(
      { story: `The torch flickers... (Error: ${error.message || String(error)})` },
      { status: 200 }
    );
  }
}
