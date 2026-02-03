export type GameState = {
  health: number;
  mana: number;
  inventory: string[];
  location: string;
};

export type StoryResponse = {
  story: string;
  state: Partial<GameState>;
  choices: {
    id: string;
    text: string;
  }[];
};
