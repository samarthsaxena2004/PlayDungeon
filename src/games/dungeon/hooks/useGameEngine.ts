'use client';

import { useReducer, useCallback, useRef, useEffect } from 'react';
import type { GameState, GameAction, Player, Fireball, Enemy, Controls, StoryEntry } from '@/lib/game-types';
import { generateDungeonMap, isWalkable } from '@/lib/map-generator';

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const TILE_SIZE = 32;
const FIREBALL_SPEED = 8;
const FIREBALL_DAMAGE = 15;
const FIREBALL_LIFETIME = 2000;
const PLAYER_SPEED = 4;
const AGGRO_RANGE = 200;
const ATTACK_COOLDOWN = 300;

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createInitialState(level: number = 1): GameState {
  const { map, spawnPoint, enemies, milestones } = generateDungeonMap(
    MAP_WIDTH,
    MAP_HEIGHT,
    TILE_SIZE,
    level
  );
  
  const player: Player = {
    id: 'player',
    x: spawnPoint.x,
    y: spawnPoint.y,
    width: TILE_SIZE * 0.8,
    height: TILE_SIZE * 0.8,
    health: 100,
    maxHealth: 100,
    direction: 'down',
    isAttacking: false,
    attackCooldown: 0,
    speed: PLAYER_SPEED,
    lastDamageTime: 0,
  };
  
  return {
    player,
    enemies,
    fireballs: [],
    milestones,
    map,
    camera: { x: spawnPoint.x - 400, y: spawnPoint.y - 300 },
    storyLog: [
      {
        id: generateId(),
        text: `Level ${level}: You descend deeper into the dungeon...`,
        timestamp: Date.now(),
        type: 'narration',
      },
    ],
    currentQuests: [
      {
        id: 'survive',
        title: 'Survive',
        description: 'Stay alive in the dungeon',
        completed: false,
        progress: 1,
        target: 1,
      },
      {
        id: 'defeat-enemies',
        title: 'Clear the Dungeon',
        description: 'Defeat all enemies',
        completed: false,
        progress: 0,
        target: enemies.length,
      },
      {
        id: 'find-portal',
        title: 'Find the Exit',
        description: 'Locate the portal to the next level',
        completed: false,
        progress: 0,
        target: 1,
      },
    ],
    gameStatus: 'playing',
    score: 0,
    level,
  };
}

function checkCollision(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_TICK': {
      if (state.gameStatus !== 'playing') return state;
      
      const { deltaTime } = action;
      let newPlayer = { ...state.player };
      let newEnemies = [...state.enemies];
      let newFireballs = [...state.fireballs];
      const newStoryLog = [...state.storyLog];
      let newScore = state.score;
      const currentTime = Date.now();
      
      // Update attack cooldown
      if (newPlayer.attackCooldown > 0) {
        newPlayer.attackCooldown = Math.max(0, newPlayer.attackCooldown - deltaTime);
      }
      
      // Update fireballs
      newFireballs = newFireballs
        .map((fb) => ({
          ...fb,
          x: fb.x + fb.vx * deltaTime * 0.06,
          y: fb.y + fb.vy * deltaTime * 0.06,
        }))
        .filter((fb) => {
          // Remove if expired
          if (currentTime - fb.createdAt > fb.lifetime) return false;
          // Remove if hit wall
          if (!isWalkable(state.map, fb.x, fb.y, fb.width, fb.height)) return false;
          return true;
        });
      
      // Check fireball-enemy collisions
      for (const fireball of newFireballs) {
        for (let i = 0; i < newEnemies.length; i++) {
          if (checkCollision(fireball, newEnemies[i])) {
            newEnemies[i] = {
              ...newEnemies[i],
              health: newEnemies[i].health - fireball.damage,
            };
            // Remove fireball
            newFireballs = newFireballs.filter((fb) => fb.id !== fireball.id);
            
            if (newEnemies[i].health <= 0) {
              newScore += newEnemies[i].type === 'boss' ? 500 : 100;
              newStoryLog.push({
                id: generateId(),
                text: `You defeated the ${newEnemies[i].type}!`,
                timestamp: currentTime,
                type: 'combat',
              });
            }
            break;
          }
        }
      }
      
      // Remove dead enemies
      newEnemies = newEnemies.filter((e) => e.health > 0);
      
      // Update enemy AI
      newEnemies = newEnemies.map((enemy) => {
        const dist = distance(enemy, newPlayer);
        const isAggro = dist < AGGRO_RANGE;
        
        if (isAggro) {
          // Move towards player
          const dx = newPlayer.x - enemy.x;
          const dy = newPlayer.y - enemy.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          
          if (len > 0) {
            const moveX = (dx / len) * enemy.speed * deltaTime * 0.06;
            const moveY = (dy / len) * enemy.speed * deltaTime * 0.06;
            
            const newX = enemy.x + moveX;
            const newY = enemy.y + moveY;
            
            if (isWalkable(state.map, newX, enemy.y, enemy.width, enemy.height)) {
              enemy = { ...enemy, x: newX };
            }
            if (isWalkable(state.map, enemy.x, newY, enemy.width, enemy.height)) {
              enemy = { ...enemy, y: newY };
            }
          }
          
          // Attack player if close enough
          if (dist < TILE_SIZE && currentTime - enemy.lastAttackTime > enemy.attackCooldown) {
            newPlayer = {
              ...newPlayer,
              health: Math.max(0, newPlayer.health - enemy.damage),
              lastDamageTime: currentTime,
            };
            enemy = { ...enemy, lastAttackTime: currentTime };
            
            newStoryLog.push({
              id: generateId(),
              text: `The ${enemy.type} strikes you for ${enemy.damage} damage!`,
              timestamp: currentTime,
              type: 'combat',
            });
          }
        }
        
        return { ...enemy, isAggro };
      });
      
      // Update camera to follow player
      const targetCameraX = newPlayer.x - 400;
      const targetCameraY = newPlayer.y - 300;
      const newCamera = {
        x: state.camera.x + (targetCameraX - state.camera.x) * 0.1,
        y: state.camera.y + (targetCameraY - state.camera.y) * 0.1,
      };
      
      // Update quests
      const newQuests = state.currentQuests.map((quest) => {
        if (quest.id === 'defeat-enemies') {
          const defeated = state.enemies.length - newEnemies.length + (quest.target - state.enemies.length);
          return {
            ...quest,
            progress: quest.target - newEnemies.length,
            completed: newEnemies.length === 0,
          };
        }
        return quest;
      });
      
      // Check game over
      if (newPlayer.health <= 0) {
        return {
          ...state,
          player: newPlayer,
          gameStatus: 'gameover',
          storyLog: [
            ...newStoryLog,
            {
              id: generateId(),
              text: 'You have fallen in the dungeon...',
              timestamp: currentTime,
              type: 'narration',
            },
          ],
        };
      }
      
      return {
        ...state,
        player: newPlayer,
        enemies: newEnemies,
        fireballs: newFireballs,
        camera: newCamera,
        storyLog: newStoryLog.slice(-50), // Keep last 50 entries
        currentQuests: newQuests,
        score: newScore,
      };
    }
    
    case 'MOVE_PLAYER': {
      if (state.gameStatus !== 'playing') return state;
      
      const { direction } = action;
      let newX = state.player.x;
      let newY = state.player.y;
      const speed = state.player.speed;
      
      switch (direction) {
        case 'up':
          newY -= speed;
          break;
        case 'down':
          newY += speed;
          break;
        case 'left':
          newX -= speed;
          break;
        case 'right':
          newX += speed;
          break;
      }
      
      // Check collision with walls
      if (!isWalkable(state.map, newX, newY, state.player.width, state.player.height)) {
        // Try sliding along walls
        if (isWalkable(state.map, newX, state.player.y, state.player.width, state.player.height)) {
          newY = state.player.y;
        } else if (isWalkable(state.map, state.player.x, newY, state.player.width, state.player.height)) {
          newX = state.player.x;
        } else {
          return { ...state, player: { ...state.player, direction } };
        }
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          x: newX,
          y: newY,
          direction,
        },
      };
    }
    
    case 'ATTACK': {
      if (state.gameStatus !== 'playing') return state;
      if (state.player.attackCooldown > 0) return state;
      
      const { direction } = state.player;
      let vx = 0;
      let vy = 0;
      
      switch (direction) {
        case 'up':
          vy = -FIREBALL_SPEED;
          break;
        case 'down':
          vy = FIREBALL_SPEED;
          break;
        case 'left':
          vx = -FIREBALL_SPEED;
          break;
        case 'right':
          vx = FIREBALL_SPEED;
          break;
      }
      
      const fireball: Fireball = {
        id: generateId(),
        x: state.player.x + state.player.width / 2 - 8,
        y: state.player.y + state.player.height / 2 - 8,
        width: 16,
        height: 16,
        vx,
        vy,
        damage: FIREBALL_DAMAGE,
        lifetime: FIREBALL_LIFETIME,
        createdAt: Date.now(),
      };
      
      return {
        ...state,
        player: {
          ...state.player,
          attackCooldown: ATTACK_COOLDOWN,
          isAttacking: true,
        },
        fireballs: [...state.fireballs, fireball],
      };
    }
    
    case 'INTERACT': {
      if (state.gameStatus !== 'playing') return state;
      
      const newMilestones = [...state.milestones];
      const newStoryLog = [...state.storyLog];
      let newQuests = [...state.currentQuests];
      let newLevel = state.level;
      let shouldAdvanceLevel = false;
      
      for (let i = 0; i < newMilestones.length; i++) {
        const milestone = newMilestones[i];
        if (milestone.collected) continue;
        
        const dist = distance(state.player, milestone);
        if (dist < milestone.interactionRadius) {
          newMilestones[i] = { ...milestone, collected: true };
          
          newStoryLog.push({
            id: generateId(),
            text: milestone.storyTrigger,
            timestamp: Date.now(),
            type: milestone.type === 'portal' ? 'milestone' : 'discovery',
          });
          
          if (milestone.type === 'portal') {
            // Check if all enemies defeated
            if (state.enemies.length === 0) {
              shouldAdvanceLevel = true;
              newLevel = state.level + 1;
              newQuests = newQuests.map((q) =>
                q.id === 'find-portal' ? { ...q, progress: 1, completed: true } : q
              );
            } else {
              newStoryLog.push({
                id: generateId(),
                text: 'The portal is sealed! Defeat all enemies first.',
                timestamp: Date.now(),
                type: 'narration',
              });
              newMilestones[i] = { ...milestone, collected: false };
            }
          }
          
          break;
        }
      }
      
      if (shouldAdvanceLevel) {
        // Generate new level
        const newState = createInitialState(newLevel);
        return {
          ...newState,
          score: state.score + 1000,
          storyLog: [
            ...newStoryLog,
            {
              id: generateId(),
              text: `You descend to level ${newLevel}...`,
              timestamp: Date.now(),
              type: 'narration',
            },
          ],
        };
      }
      
      return {
        ...state,
        milestones: newMilestones,
        storyLog: newStoryLog.slice(-50),
        currentQuests: newQuests,
      };
    }
    
    case 'ADD_STORY': {
      return {
        ...state,
        storyLog: [
          ...state.storyLog,
          {
            ...action.entry,
            id: generateId(),
            timestamp: Date.now(),
          },
        ].slice(-50),
      };
    }
    
    case 'RESET_GAME': {
      return createInitialState(1);
    }
    
    case 'SET_GAME_STATUS': {
      return {
        ...state,
        gameStatus: action.status,
      };
    }
    
    default:
      return state;
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, null, () => createInitialState(1));
  const controlsRef = useRef<Controls>({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    interact: false,
  });
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const gameLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Handle movement
    const controls = controlsRef.current;
    if (controls.up) dispatch({ type: 'MOVE_PLAYER', direction: 'up' });
    if (controls.down) dispatch({ type: 'MOVE_PLAYER', direction: 'down' });
    if (controls.left) dispatch({ type: 'MOVE_PLAYER', direction: 'left' });
    if (controls.right) dispatch({ type: 'MOVE_PLAYER', direction: 'right' });
    
    // Update game state
    dispatch({ type: 'UPDATE_TICK', deltaTime });
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);
  
  const startGame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);
  
  const stopGame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);
  
  const setControl = useCallback((control: keyof Controls, value: boolean) => {
    controlsRef.current[control] = value;
  }, []);
  
  const attack = useCallback(() => {
    dispatch({ type: 'ATTACK' });
  }, []);
  
  const interact = useCallback(() => {
    dispatch({ type: 'INTERACT' });
  }, []);
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    startGame();
  }, [startGame]);
  
  const addStoryEntry = useCallback((entry: Omit<StoryEntry, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_STORY', entry });
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return {
    state,
    dispatch,
    setControl,
    attack,
    interact,
    resetGame,
    startGame,
    stopGame,
    addStoryEntry,
  };
}
