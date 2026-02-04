export type GameState = {
  health: number;
  mana: number;
  inventory: string[];
  location: string;

  meta: {
    danger: number;
    lastEvent: string;
    turn: number;
  };

  combat?: {
    enemy: string;
    hp: number;
    intent: string;
  };
};

export type StoryResponse = {
  ui: any[];
  state: GameState;
};
