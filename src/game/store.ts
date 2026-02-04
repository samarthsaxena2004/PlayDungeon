import { create } from 'zustand';

// ─── TYPES ──────────────────────────────────────

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

export type GameStats = {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  level: number;
  xp: number;
};

export type GameMeta = {
  location: string;
  dangerLevel: number; // 0-100
  mood: 'peaceful' | 'tense' | 'combat' | 'mysterious';
  turn: number;
};

export type GenerativeNode = {
  component: string;
  props: Record<string, any>;
};

export type GameStore = {
  // Chat
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;

  // Game State
  stats: GameStats;
  meta: GameMeta;
  inventory: string[];
  
  // Generative UI
  activeScene: GenerativeNode[];
  isThinking: boolean;
  
  // Actions
  updateStats: (diff: Partial<GameStats>) => void;
  updateMeta: (diff: Partial<GameMeta>) => void;
  setScene: (nodes: GenerativeNode[]) => void;
  setThinking: (thinking: boolean) => void;
  resetGame: () => void;
};

// ─── STORE ──────────────────────────────────────

export const useGameStore = create<GameStore>((set) => ({
  messages: [{
    id: 'init-1',
    role: 'assistant',
    content: "Welcome to the Deep Dungeon. The air is cold and stale. What do you do?",
    timestamp: Date.now()
  }],
  
  stats: {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    gold: 0,
    level: 1,
    xp: 0
  },
  
  meta: {
    location: "Entrance Hall",
    dangerLevel: 0,
    mood: 'mysterious',
    turn: 0
  },
  
  inventory: [],
  activeScene: [], // Will be populated by AI
  isThinking: false,

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }]
  })),

  updateStats: (diff) => set((state) => ({
    stats: { ...state.stats, ...diff }
  })),

  updateMeta: (diff) => set((state) => ({
    meta: { ...state.meta, ...diff }
  })),

  setScene: (nodes) => set({ activeScene: nodes }),
  
  setThinking: (val) => set({ isThinking: val }),
  
  resetGame: () => set({
    messages: [],
    stats: { health: 100, maxHealth: 100, mana: 50, maxMana: 50, gold: 0, level: 1, xp: 0 },
    inventory: [],
    activeScene: []
  })
}));
