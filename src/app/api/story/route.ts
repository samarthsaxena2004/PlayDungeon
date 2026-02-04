import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function roll(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SYSTEM = `
YOU ARE PLAYDUNGEON COMBAT ENGINE.

MECHANICS:
- Damage 5–18
- Crit 10% → +8 dmg
- Mana skills cost 8–14
- Enemies 25–60 hp
- Loot tiers: scrap / iron / arcane
- Danger 0–100

AVAILABLE UI:
DungeonCanvas, StoryText, ChoiceButtons,
PlayerStatus, InventoryPanel,
CombatHUD, CombatLog, SkillBar, DeathScreen

RULES:
- Start with DungeonCanvas
- If health ≤ 0 → ONLY DeathScreen
- If in combat → include CombatHUD + SkillBar
- Max 5 components
- Always ChoiceButtons unless dead

RETURN ONLY JSON:
{
  ui: [],
  state: {}
}
`;

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

  let s = { ...state };

  // ─── TURN LOGIC ──────────────────────────────
  s.meta = s.meta || { danger: 20, lastEvent: "", turn: 0 };
  s.meta.turn++;

  // Combat simulation
  const log: string[] = [];

  if (action === "strike" && s.combat) {
    let dmg = roll(5, 18);
    if (Math.random() < 0.1) dmg += 8;

    s.combat.hp -= dmg;
    log.push(`You strike for ${dmg}`);

    if (s.combat.hp <= 0) {
      log.push(`${s.combat.enemy} slain`);
      s.inventory.push("iron scrap");
      delete s.combat;
      s.meta.danger -= 15;
    }
  }

  if (action === "spark" && s.mana >= 10) {
    s.mana -= 10;
    const dmg = roll(10, 20);
    if (s.combat) {
      s.combat.hp -= dmg;
      log.push(`Spark burns for ${dmg}`);
    }
  }

  // Enemy turn
  if (s.combat) {
    const edmg = roll(4, 12);
    s.health -= edmg;
    log.push(`${s.combat.enemy} hits ${edmg}`);
  }

  // Death
  if (s.health <= 0) {
    return Response.json({
      ui: [
        {
          component: "DeathScreen",
          props: { reason: s.meta.lastEvent || "Blood loss" }
        }
      ],
      state: s,
    });
  }

  // ─── AI DIRECTOR ─────────────────────────────

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.88,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: JSON.stringify({ action, state: s, log }),
        },
      ],
    });

    const raw = completion.choices[0].message.content!;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }

    if (!parsed?.ui) throw new Error();

    // inject log + skills when in combat
    if (s.combat) {
      parsed.ui.push({
        component: "CombatLog",
        props: { lines: log }
      });

      parsed.ui.push({
        component: "SkillBar",
        props: { mana: s.mana }
      });
    }

    parsed.state = s;
    return Response.json(parsed);

  } catch {
    return Response.json({
      ui: [
        {
          component: "DungeonCanvas",
          props: { location: s.location }
        },
        {
          component: "StoryText",
          props: { text: "The dungeon hesitates..." }
        },
        {
          component: "ChoiceButtons",
          props: {
            choices: [
              { id: "strike", text: "Strike" },
              { id: "focus", text: "Focus" }
            ]
          }
        }
      ],
      state: s,
    });
  }
}
