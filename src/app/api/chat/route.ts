import { TAMBO_TOOLS } from "@/lib/tambo-tools";
import { generateWithTambo } from "@/lib/tambo-client";
import { getPersonalitySystemPrompt, PlayerProfile } from "@/lib/personality";

// Tambo-only Chat implementation (Robust)
export async function POST(req: Request) {
  try {
    const { message, gameContext } = await req.json();

    const personalityInstructions = gameContext.profile ? getPersonalitySystemPrompt(gameContext.profile as PlayerProfile) : "";

    const systemPrompt = `You are the GAME ENGINE for Deep Dungeon.
    
    CRITICAL PROTOCOL:
    1. You DO NOT chat. You EXECUTE.
    2. Every user input is an INTENT to change the game state.
    3. You MUST call a tool to resolve the intent.
    4. If the user asks a question ("Where am I?"), use 'analyze_surroundings' or similar tool, OR use 'narrate' tool if available.
    
    Game Context:
    Health: ${gameContext.health}%
    Enemies Nearby: ${gameContext.enemiesNearby}
    
    You are the LAW. Your tool calls define reality.
    
    ${personalityInstructions}
    `;

    const result = await generateWithTambo(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      {
        model: "tambo-chat-v1",
        tools: TAMBO_TOOLS,
        tool_choice: "required", // FORCE ACTION
        max_tokens: 100,
      }
    );

    return Response.json({
      reply: result.content || null,
      toolCalls: result.toolCalls,
      suggestedAction: null
    });

  } catch (error: any) {
    console.error('[Chat] Tambo error:', error);
    return Response.json(
      { reply: `Tambo unavailable: ${error.message}`, toolCalls: [], suggestedAction: null },
      { status: 503 }
    );
  }
}
