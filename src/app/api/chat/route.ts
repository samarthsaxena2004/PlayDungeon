import { TAMBO_TOOLS } from "@/lib/tambo-tools";
import { generateWithTambo } from "@/lib/tambo-client";
import { getPersonalitySystemPrompt, PlayerProfile } from "@/lib/personality";

// Tambo-only Chat implementation (Robust)
export async function POST(req: Request) {
  try {
    const { message, gameContext } = await req.json();

    const personalityInstructions = gameContext.profile ? getPersonalitySystemPrompt(gameContext.profile as PlayerProfile) : "";

    const systemPrompt = `You are Tambo, the Dungeon Master and Game Engine Interface for Deep Dungeon.
    Game Context:
    Health: ${gameContext.health}%
    Enemies Nearby: ${gameContext.enemiesNearby}
    
    CRITICAL INSTRUCTION:
    You are NOT just a narrator. You are the GAME ENGINE.
    If the user's input implies ANY action (attack, look, move, check stats, mute), you MUST use the provided tools to execute it.
    
    - "I attack the goblin" -> triggerAttack()
    - "What do you see?" -> triggerAnalyze()
    - "Dodge!" -> triggerGameAction()
    
    Do not just describe the action. EXECUTE IT via tools.
    
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
        tool_choice: "auto",
        max_tokens: 150,
      }
    );

    return Response.json({
      reply: result.content || "...",
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
