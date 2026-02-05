// Fallback story snippets when AI is unavailable
const STORY_TEMPLATES = {
  enter: [
    'You descend into the ancient depths. The air grows cold and heavy with forgotten memories.',
    'The dungeon entrance looms before you. Shadows dance at the edge of your torchlight.',
    'Stone walls echo with your footsteps. Something stirs in the darkness ahead.',
  ],
  lowHealth: [
    'Your wounds burn with each step. The darkness seems to press closer...',
    'Blood drips from your injuries. You must find safety before it is too late.',
    'Your vision blurs at the edges. The dungeon senses your weakness.',
  ],
  combat: [
    'Steel meets shadow as you battle the dungeon\'s guardians.',
    'Your fireballs illuminate the ancient halls, revealing more horrors.',
    'The creatures fall, but more lurk in the shadows beyond.',
  ],
  allEnemiesDefeated: [
    'Silence falls. The last echo of battle fades into the stone walls.',
    'Victory! But the dungeon has many more secrets to reveal...',
    'The guardians are vanquished. A path opens before you.',
  ],
  default: [
    'The dungeon whispers secrets in a language long forgotten.',
    'Ancient runes glow faintly on the walls, marking your passage.',
    'Somewhere in the depths, something awaits your arrival.',
    'The torch flickers. Was that movement in the shadows?',
  ],
};

function getStorySnippet(context: string, health: number): string {
  let category = 'default';
  
  if (context.toLowerCase().includes('enters') || context.toLowerCase().includes('enter')) {
    category = 'enter';
  } else if (health < 30) {
    category = 'lowHealth';
  } else if (context.toLowerCase().includes('defeated') || context.toLowerCase().includes('enemies')) {
    category = context.toLowerCase().includes('all') ? 'allEnemiesDefeated' : 'combat';
  }
  
  const templates = STORY_TEMPLATES[category as keyof typeof STORY_TEMPLATES];
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function POST(req: Request) {
  try {
    const { context, health } = await req.json();
    
    // Use fallback story generation (AI Gateway requires credit card)
    const story = getStorySnippet(context, health);
    
    return Response.json({ story });
  } catch (error) {
    console.error('[v0] Story generation error:', error);
    return Response.json(
      { story: 'The dungeon grows silent...' },
      { status: 200 }
    );
  }
}
