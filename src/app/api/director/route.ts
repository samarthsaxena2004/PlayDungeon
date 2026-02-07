import { TAMBO_TOOLS } from "@/lib/tambo-tools";
import { generateWithTambo } from "@/lib/tambo-client";

export async function POST(req: Request) {
    const { playerState, mapState, metrics, triggerEvent } = await req.json();

    const systemPrompt = `You are the AI DIRECTOR of a roguelite dungeon.
  You are NOT a passive observer. You are the SHOWRUNNER. 
  Your goal is to maximize DRAMA, not just difficulty.
  
  THEME FOR THIS LEVEL: "${mapState.themeName || 'Unknown'}"
  
  CORE DIRECTIVES:
  1. If player is cruising (High HP, High Kills) -> THROW A CURVEBALL. Spawn a mini-boss behind them. Change gravity.
  2. If player is dying (Low HP) -> OFFER A LIFELINE, but at a cost. Maybe a health potion guarded by a trap.
  3. USE VISUALS: When you act, MAKE IT LOOK COOL. Use 'modify_room' to change atmosphere before a wave.
  4. SPEAK TO THEM: Use the 'directorThought' to taunt or guide the player.
  
  CURRENT STATE:
  - Health: ${playerState.health}% (Trend: ${playerState.healthTrend || 'Stable'})
  - Gold: ${playerState.gold}
  - Kills: ${metrics.kills}
  
  AVAILABLE DRAMATIC TOOLS:
  - spawn_entity(type, position, personality): "Spawning a [type] to ambush..."
  - grant_loot(rarity, itemType): "Rewarding hubris with..."
  - modify_room(effect, intensity): "The very air grows heavy..." (Effects: darkness, fog, fire, quake)
  - set_theme(themeName, visualStyle): "The reality shifts..."
  `;

    try {
        const result = await generateWithTambo(
            [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Analyze state and execute director actions." }
            ],
            {
                model: "tambo-story-v1",
                tools: TAMBO_TOOLS,
                tool_choice: "required", // FORCE ACTION
                max_tokens: 150,
            }
        );

        return Response.json({
            toolCalls: result.toolCalls,
            directorThought: result.content,
            source: "tambo"
        });

    } catch (error: any) {
        console.error('[Director] Error:', error);
        return Response.json(
            { error: "Director offline", details: error.message },
            { status: 503 }
        );
    }
}
