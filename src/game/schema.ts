// ─── CORE STATE ───────────────────────────────────────────

export type GameState = {
  health: number;
  mana: number;
  inventory: string[];
  location: string;

  meta?: {
    danger: number;        // 0–100
    mood: string;          // dread / hope / tense / calm
    lastEvent: string;
    audio?: string;        // hint for ambience
  };
};

// ─── TAMBO UI CONTRACT ────────────────────────────────────

export type TamboNode = {
  component: string;
  props: Record<string, any>;
};

export type TamboScreen = {
  ui: TamboNode[];
  state: GameState;
};

// ─── DIRECTOR MEMORY ──────────────────────────────────────

export type WorldMemory = {
  visited: string[];
  threats: Record<string, number>;
  inventoryLore: Record<string, string>;
};
