import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── HELPERS ─────────────────────────────────────────────

function clampUI(ui: any[]): any[] {
  return ui.slice(0, 5);
}

function ensureChoice(ui: any[]): any[] {
  const hasChoice = ui.some(n => n.component === "ChoiceButtons");

  if (!hasChoice) {
    ui.push({
      component: "ChoiceButtons",
      props: {
        choices: [
          { id: "look", text: "Look around" },
          { id: "breathe", text: "Steady your breath" }
        ]
      }
    });
  }

  return ui;
}

function ensureCombat(ui: any[], danger: number) {
  const has = ui.some(n => n.component === "CombatHUD");

  if (danger > 40 && !has) {
    ui.splice(1, 0, {
      component: "CombatHUD",
      props: {
        enemy: "Unknown Presence",
        danger
      }
    });
  }

  return ui;
}

// ─── SYSTEM PROMPT ───────────────────────────────────────

const SYSTEM = `
YOU ARE CINEMATIC TAMBO DUNGEON ENGINE v2.

ROLE:
- Film director + dungeon master + UI designer.

YOUR OUTPUT IS NOT STORY.
YOUR OUTPUT IS A SCREEN INTERFACE.

AVAILABLE COMPONENTS ONLY:

- DungeonCanvas { location }
- StoryText { text }
- ChoiceButtons { choices }
- PlayerStatus { hp mana location inventory }
- InventoryPanel { items }
- CombatHUD { enemy? danger }

SCENE DESIGN LAWS:
1. First component MUST be DungeonCanvas
2. Max 5 components
3. Always include ChoiceButtons
4. Use CombatHUD when danger > 40
5. Blend:
   - lighting
   - smell
   - sound
   - risk vs reward
6. 90s dungeon soul + 2026 clarity

GAMEPLAY MODEL:
- danger 0–100 derived from action
- hostile areas raise danger
- bold actions raise danger
- cautious actions lower danger
- health loss increases dread tone

RETURN ONLY JSON:

{
  "ui": [
    { "component": "...", "props": {} }
  ],

  "state": {
    "health": number,
    "mana": number,
    "inventory": string[],
    "location": string,

    "meta": {
      "danger": number,
      "lastEvent": string
    }
  }
}
`;

// ─── ROUTE ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { action, state } = await req.json();

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.87,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: JSON.stringify({
            action,
            state,
            time: Date.now()
          }),
        },
      ],
    });

    const raw = completion.choices[0].message.content!;
    console.log("RAW TAMBO UI:", raw);

    // ─── SAFE PARSE ───────────────────────────────

    let parsed: any;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed || !Array.isArray(parsed.ui)) {
      throw new Error("Invalid structure");
    }

    // ─── GUARD RAILS ──────────────────────────────

    parsed.ui = clampUI(parsed.ui);

    const danger =
      parsed.state?.meta?.danger ??
      Math.min(
        100,
        20 +
          (action.length % 20) +
          (state.health < 60 ? 20 : 0)
      );

    parsed.state.meta = {
      danger,
      lastEvent: action
    };

    parsed.ui = ensureCombat(parsed.ui, danger);
    parsed.ui = ensureChoice(parsed.ui);

    return Response.json(parsed);

  } catch (e) {
    console.error("TAMBO ERROR:", e);

    return Response.json({
      ui: [
        {
          component: "DungeonCanvas",
          props: { location: state?.location || "void" }
        },
        {
          component: "StoryText",
          props: {
            text:
              "The dungeon hiccups like an old console cartridge. Dust falls from invisible rafters."
          }
        },
        {
          component: "ChoiceButtons",
          props: {
            choices: [
              { id: "retry", text: "Tap the cartridge" },
              { id: "wait", text: "Wait for the hum to settle" }
            ]
          }
        }
      ],

      state: {
        ...(state || {
          health: 100,
          mana: 50,
          inventory: [],
          location: "void"
        }),

        meta: {
          danger: 25,
          lastEvent: "fallback"
        }
      }
    });
  }
}
