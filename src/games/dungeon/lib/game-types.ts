export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Entity extends Position {
  id: string;
  width: number;
  height: number;
}

export interface ActiveEffect {
  type: 'speed' | 'damage' | 'shield';
  duration: number; // ms remaining
  value: number; // multiplier or amount
  startTime: number;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isAttacking: boolean;
  attackCooldown: number;
  speed: number;
  lastDamageTime: number;
  activeEffects: ActiveEffect[];
}

export interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  type: 'slime' | 'skeleton' | 'ghost' | 'boss';
  speed: number;
  damage: number;
  isAggro: boolean;
  lastAttackTime: number;
  attackCooldown: number;
}

export interface Fireball extends Entity, Velocity {
  damage: number;
  lifetime: number;
  createdAt: number;
}

export interface Milestone extends Entity {
  type: 'key' | 'treasure' | 'scroll' | 'portal' | 'npc';
  collected: boolean;
  storyTrigger: string;
  interactionRadius: number;
}

export interface Tile {
  x: number;
  y: number;
  type: 'floor' | 'wall' | 'pit' | 'door' | 'spawn';
  walkable: boolean;
}

export interface GameMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: Tile[][];
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  fireballs: Fireball[];
  milestones: Milestone[];
  map: GameMap;
  camera: Position;
  storyLog: StoryEntry[];
  currentQuests: Quest[];
  gameStatus: 'playing' | 'paused' | 'gameover' | 'victory';
  score: number;
  level: number;
  coins: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  target: number;
}

export interface StoryEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'narration' | 'dialogue' | 'discovery' | 'combat' | 'milestone';
}

export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  interact: boolean;
}

export type GameAction =
  | { type: 'MOVE_PLAYER'; direction: 'up' | 'down' | 'left' | 'right' }
  | { type: 'STOP_PLAYER' }
  | { type: 'ATTACK' }
  | { type: 'INTERACT' }
  | { type: 'SPAWN_FIREBALL'; direction: Position }
  | { type: 'UPDATE_TICK'; deltaTime: number }
  | { type: 'DAMAGE_PLAYER'; amount: number }
  | { type: 'DAMAGE_ENEMY'; enemyId: string; amount: number }
  | { type: 'COLLECT_MILESTONE'; milestoneId: string }
  | { type: 'ADD_STORY'; entry: Omit<StoryEntry, 'id' | 'timestamp'> }
  | { type: 'COMPLETE_QUEST'; questId: string }
  | { type: 'RESET_GAME' }
  | { type: 'SET_GAME_STATUS'; status: GameState['gameStatus'] }
  | { type: 'PURCHASE_ITEM'; item: { type: 'speed' | 'damage' | 'heal'; cost: number; value: number; duration?: number } };
