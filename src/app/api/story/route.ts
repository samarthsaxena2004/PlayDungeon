import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateWithGroq(systemPrompt: string, userPrompt: string, playerName: string) {
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

  return {
    story: chatCompletion.choices[0]?.message?.content || "The dungeon shadows shift uneasily...",
    source: "Groq"
  };
}

// Tambo generation using raw fetch to avoid complex SDK Thread state
async function generateWithTambo(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.TAMBO_API_KEY || process.env.NEXT_PUBLIC_TAMBO_API_KEY;
  if (!apiKey) throw new Error("Missing Tambo API Key");

  // Attempting standard OpenAI-compatible endpoint on Tambo's base URL
  const response = await fetch("https://api.tambo.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "tambo-story-v1", // This might need adjustment if specific models are required
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tambo API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return {
    story: data.choices?.[0]?.message?.content || "The dungeon whispers...",
    source: "Tambo"
  };
}

export async function POST(req: Request) {
  const { context, health, recentEvents, level, playerName } = await req.json();

  const systemPrompt = `You are the Dungeon Master (DM) for a dark fantasy RPG called 'Deep Dungeon'. 
    The player${playerName ? ` named ${playerName}` : ' named Adventurer'} is exploring a procedurally generated dungeon.
    Your goal is to provide a brief, atmospheric, and immersive narration based on the game events.
    
    CRITICAL RULES:
    1. Keep it extremely short (max 1-2 sentences).
    2. Be descriptive but concise.
    3. Use a dark, mysterious tone.
    4. Focus on the action and immediate atmosphere.
    5. Avoid generic phrases like "You enter the dungeon". Use sensory details.
    
    Current Level: ${level || 1}
    Player Health: ${health}%
    `;

  const userPrompt = `
    Context: ${context}
    Recent Events: ${recentEvents ? recentEvents.join(', ') : 'None'}
    
    Narrate what happens next or describe the atmosphere.
    `;

  try {
    // Try Tambo first
    try {
      console.log('[Story] Attempting generation with Tambo...');
      const result = await generateWithTambo(systemPrompt, userPrompt);
      return Response.json(result);
    } catch (tamboError) {
      console.warn('[Story] Tambo generation failed, falling back to Groq:', tamboError);
      // Fallback to Groq
      const result = await generateWithGroq(systemPrompt, userPrompt, playerName);
      return Response.json(result);
    }
  } catch (error: any) {
    console.error('[Story] All generation failed:', error);
    return Response.json(
      { story: `The torch flickers... (Error: ${error.message || String(error)})`, source: "System" },
      { status: 200 }
    );
  }
}
