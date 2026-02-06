import { TAMBO_TOOLS } from "@/lib/tambo-tools";
import { generateWithTambo } from "@/lib/tambo-client";
import { getPersonalitySystemPrompt, PlayerProfile } from "@/lib/personality";

export async function POST(req: Request) {
  const { context, health, recentEvents, level, playerName, profile } = await req.json();

  const personalityInstructions = profile ? getPersonalitySystemPrompt(profile as PlayerProfile) : "";

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
    
    ${personalityInstructions}
    `;

  const userPrompt = `
    Context: ${context}
    Recent Events: ${recentEvents ? recentEvents.join(', ') : 'None'}
    
    Narrate what happens next or describe the atmosphere.
    `;

  const models = ["tambo-story-v1", "gpt-5.2"];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`[Story] Attempting generation with ${model}...`);
      const result = await generateWithTambo(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        {
          model,
          tools: TAMBO_TOOLS,
          tool_choice: "auto",
          max_tokens: 200,
        }
      );

      return Response.json({
        story: result.content || "The dungeon whispers...",
        toolCalls: result.toolCalls,
        source: model
      });
    } catch (error: any) {
      console.error(`[Story] Generation failed with ${model}:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  return Response.json(
    { story: `Tambo unavailable: ${lastError?.message || "Unknown error"}`, source: "System" },
    { status: 503 }
  );
}
