import { TAMBO_TOOLS } from "@/lib/tambo-tools";
import { generateWithTambo } from "@/lib/tambo-client";

export async function POST(req: Request) {
    const { playerState, mapState, metrics, triggerEvent } = await req.json();

    const systemPrompt = `You are the AI Director of a roguelike dungeon crawler. 
  Your goal is to maintain an engaging "Flow State" for the player.
  
  EVENT: ${triggerEvent || 'PERIODIC_CHECK'}
  
  ANALYSIS RULES:
  1. If player Health > 80% and Kills/Min is high -> INCREASE DIFFICULTY. Spawn stronger enemies or ambush them.
  2. If player Health < 30% -> REDUCE DIFFICULTY. Spawn fewer enemies or maybe a health potion (if available in tools).
  3. Uses relative positioning: "behind", "flanking", "ahead".
  4. NEW: You can modify room physics! make it dark, heavy (slow), or dangerous.
  
  CURRENT STATE:
  - Health: ${playerState.health}%
  - Gold: ${playerState.gold}
  - Kills: ${metrics.kills}
  - Time Alive: ${metrics.timeAlive}s
  
  AVAILABLE TOOLS:
  - spawn_entity(type, position, personality)
  - grant_loot(rarity, itemType) - use rarely, only for big achievements
  - modify_room(effect, speedMultiplier, damageMultiplier, visibility, gravity)
    * speedMultiplier: 0.5 (slow) to 1.5 (fast)
    * damageMultiplier: 0.5 (safe) to 2.0 (deadly)
    * visibility: 0.1 (dark) to 1.0 (clear)
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
