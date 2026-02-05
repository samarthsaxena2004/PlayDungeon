// Fallback responses when AI is unavailable
const FALLBACK_RESPONSES: Record<string, string[]> = {
  attack: [
    'Press SPACE or tap the Fire button to launch fireballs at enemies!',
    'Aim in the direction you want to shoot, then press SPACE.',
    'Fireballs deal damage to enemies. Watch your cooldown!',
  ],
  move: [
    'Use WASD or Arrow keys to navigate the dungeon.',
    'Move carefully - enemies will chase you if you get too close!',
    'Explore every corner to find hidden treasures and keys.',
  ],
  help: [
    'Defeat enemies with fireballs (SPACE), collect keys to unlock doors, and reach the portal!',
    'Keep an eye on your health bar. Avoid enemy attacks!',
    'Check the minimap in the corner to see nearby enemies and items.',
  ],
  default: [
    'The dungeon holds many secrets. Explore carefully, brave adventurer!',
    'Stay vigilant! Enemies lurk in the shadows.',
    'Your fireball is your greatest weapon. Use it wisely!',
    'Collect all milestones to complete each level.',
  ],
};

function getFallbackResponse(message: string, gameContext: { health: number; enemiesNearby: number }): { reply: string; suggestedAction: string | null } {
  const lowerMessage = message.toLowerCase();
  
  let category = 'default';
  let suggestedAction: string | null = null;
  
  if (lowerMessage.includes('attack') || lowerMessage.includes('shoot') || lowerMessage.includes('fire')) {
    category = 'attack';
    suggestedAction = 'attack';
  } else if (lowerMessage.includes('move') || lowerMessage.includes('walk') || lowerMessage.includes('go')) {
    category = 'move';
    suggestedAction = 'explore';
  } else if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('tip')) {
    category = 'help';
  }
  
  // Context-aware additions
  let contextNote = '';
  if (gameContext.health < 30) {
    contextNote = ' Be careful - your health is low!';
    suggestedAction = 'dodge';
  } else if (gameContext.enemiesNearby > 0) {
    contextNote = ` There are ${gameContext.enemiesNearby} enemies nearby!`;
  }
  
  const responses = FALLBACK_RESPONSES[category];
  const reply = responses[Math.floor(Math.random() * responses.length)] + contextNote;
  
  return { reply, suggestedAction };
}

export async function POST(req: Request) {
  try {
    const { message, gameContext } = await req.json();
    
    // Use fallback responses (AI Gateway requires credit card)
    const { reply, suggestedAction } = getFallbackResponse(message, gameContext);
    
    return Response.json({ reply, suggestedAction });
  } catch (error) {
    console.error('[v0] Chat API error:', error);
    return Response.json(
      { reply: 'The magical connection is unstable. Try again later.', suggestedAction: null },
      { status: 500 }
    );
  }
}
