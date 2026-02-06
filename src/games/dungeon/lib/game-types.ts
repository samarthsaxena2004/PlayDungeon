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
  type: string; // 'slime' | 'skeleton' | 'ghost' | 'boss' | custom
  visualEmoji?: string; // Optional visual representation for custom mobs
  speed: number;
  damage: number;
  morale: number; // 0-100, low morale causes fleeing
  isAggro: boolean;
  lastAttackTime: number;
  attackCooldown: number;
  direction?: 'up' | 'down' | 'left' | 'right';
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

import { PlayerProfile } from '@/lib/personality';

export interface AIState {
  fear: number;      // 0-100: How scary the dungeon is
  sanity: number;    // 0-100: Player's mental state (100 = sane)
  reputation: number; // 0-100: How much entities respect the player
  narrativeArc: 'rising_action' | 'climax' | 'falling_action' | 'calm';
}

export interface RoomModifiers {
  speedMultiplier: number; // 1.0 = normal
  damageMultiplier: number; // 1.0 = normal
  visibility: number; // 0-1, 1 = full
  gravity: number; // 1.0 = normal
  atmosphere: string; // e.g. "heavy_mist", "oppressive_heat"
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
  profile: PlayerProfile;
  aiState: AIState;        // New Persistent Memory
  roomModifiers: RoomModifiers; // New Legislative Rules
  directorTrigger: 'combat_start' | 'new_level' | 'low_health' | 'periodic' | null;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  target: number;
  reward?: {
    gold: number;
    item?: string;
  };
}

export interface StoryEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'narration' | 'dialogue' | 'discovery' | 'combat' | 'milestone' | 'danger';
}

export interface AIAction {
  tool: string;
  args: any;
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
  | { type: 'PURCHASE_ITEM'; item: { type: 'speed' | 'damage' | 'heal'; cost: number; value: number; duration?: number } }
  | { type: 'APPLY_AI_ACTION'; tool: string; args: any }
  | { type: 'CLEAR_DIRECTOR_TRIGGER' };
