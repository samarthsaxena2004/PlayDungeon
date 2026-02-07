'use client';

import { useReducer, useCallback, useRef, useEffect } from 'react';
import type { GameState, GameAction, Player, Fireball, Enemy, Controls, AIAction, StoryEntry } from '@/games/dungeon/lib/game-types';
import { generateDungeonMap, isWalkable } from '@/games/dungeon/lib/map-generator';
import { INITIAL_PROFILE, updateProfile } from '@/lib/personality';

import { DEFAULT_THEME, DungeonTheme } from '@/games/dungeon/lib/director-config';

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

function createInitialState(level: number = 1, initialGold: number = 0, theme: DungeonTheme = DEFAULT_THEME): GameState {
  const { map, spawnPoint, enemies, milestones } = generateDungeonMap(
    MAP_WIDTH,
    MAP_HEIGHT,
    TILE_SIZE,
    level,
    theme
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
    activeEffects: [],
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
        text: `Level ${level}: The Director watches... (${theme.name})`,
        timestamp: Date.now(),
        type: 'narration',
      }
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
    coins: initialGold,
    profile: INITIAL_PROFILE,
    aiState: {
      fear: 0,
      sanity: 100,
      reputation: 50,
      narrativeArc: 'calm'
    },
    roomModifiers: {
      speedMultiplier: 1.0,
      damageMultiplier: 1.0,
      visibility: 1.0,
      gravity: 1.0,
      atmosphere: 'clear'
    },
    directorTrigger: null,
    theme,
    nextTheme: null,
    visualEffects: [],
    runStats: {
      enemiesDefeated: 0,
      damageTaken: 0,
      coinsEarned: 0 // Track gross income
    }
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
      let newScore = state.score;
      let newCoins = state.coins;
      let newStats = { ...state.runStats }; // Copy stats for mutation
      const currentTime = Date.now();

      // Update active effects
      const activeEffects = newPlayer.activeEffects.filter(e => {
        return currentTime - e.startTime < e.duration;
      });
      newPlayer.activeEffects = activeEffects;

      // Calculate current speed based on effects AND Room Rules (Tambo Law)
      const speedMultiplier = activeEffects.find(e => e.type === 'speed')?.value || 1;
      newPlayer.speed = PLAYER_SPEED * speedMultiplier * state.roomModifiers.speedMultiplier;

      // Update attack cooldown
      if (newPlayer.attackCooldown > 0) {
        newPlayer.attackCooldown = Math.max(0, newPlayer.attackCooldown - deltaTime);
      }

      // --- OPTIMIZED ENTITY LOOP ---
      // Single pass for enemy logic, collision, and updates
      let combatStarted = false;
      const validEnemies: Enemy[] = [];
      const validFireballs: Fireball[] = [];

      // Update Visual Effects
      const activeVisualEffects = state.visualEffects.filter(eff => currentTime - eff.startTime < eff.duration);

      // Process Fireballs first (Movement & Expiry)
      // (Filtered in-place logic to avoid map+filter overhead)
      for (const fb of state.fireballs) {
        if (currentTime - fb.createdAt > fb.lifetime) continue;

        const nextX = fb.x + fb.vx * deltaTime * 0.06;
        const nextY = fb.y + fb.vy * deltaTime * 0.06;

        if (!isWalkable(state.map, nextX, nextY, fb.width, fb.height)) continue;

        validFireballs.push({ ...fb, x: nextX, y: nextY });
      }
      newFireballs = validFireballs;

      // Process Enemies (Movement, AI, Combat, Collision)
      for (let i = 0; i < state.enemies.length; i++) {
        let enemy = state.enemies[i];
        if (enemy.health <= 0) continue; // Skip dead

        // 1. Check Fireball Collisions
        // (Spatial optimization: only check if fireball count > 0)
        if (newFireballs.length > 0) {
          let hit = false;
          for (let f = 0; f < newFireballs.length; f++) {
            const fb = newFireballs[f];
            // Simple AABB overlap
            if (
              fb.x < enemy.x + enemy.width &&
              fb.x + fb.width > enemy.x &&
              fb.y < enemy.y + enemy.height &&
              fb.y + fb.height > enemy.y
            ) {
              // Collision!
              enemy = { ...enemy, health: enemy.health - fb.damage };
              newFireballs.splice(f, 1); // Mutate local array for efficiency (it's a copy)
              f--; // Adjust index

              if (enemy.health <= 0) {
                // Death logic
                const enemyType = enemy.type;
                newScore += enemyType === 'boss' ? 500 : 100;
                let coinDrop = enemyType === 'boss' ? 100 :
                  enemyType === 'ghost' ? 15 :
                    enemyType === 'skeleton' ? 10 : 5;
                // Random variance
                coinDrop += Math.floor(Math.random() * coinDrop);
                newCoins += coinDrop;
                newStats.coinsEarned += coinDrop;
                newStats.enemiesDefeated++;
                state.profile = updateProfile(state.profile, { type: 'kill' });

                // Combat Log: Enemy Defeated
                state.storyLog.push({
                  id: generateId(),
                  text: `Defeated ${enemy.type}! +${coinDrop} gold.`,
                  timestamp: Date.now(),
                  type: 'combat'
                });

                hit = true;
                break; // Enemy dead, stop checking fireballs
              }
            }
          }
          if (enemy.health <= 0) continue; // Died from fireball, don't process AI
        }

        // 2. AI & Movement
        const dist = distance(enemy, newPlayer);
        const isAggro = dist < AGGRO_RANGE;

        if (!enemy.isAggro && isAggro) combatStarted = true;

        // Flee or Chase
        const isFleeing = enemy.morale < 30 && enemy.health < enemy.maxHealth * 0.3;
        let moveX = 0, moveY = 0;

        if (isFleeing) {
          const dx = enemy.x - newPlayer.x;
          const dy = enemy.y - newPlayer.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            moveX = (dx / len) * enemy.speed * 1.5 * deltaTime * 0.06;
            moveY = (dy / len) * enemy.speed * 1.5 * deltaTime * 0.06;
          }
          // Morale recovery
          if (dist > AGGRO_RANGE * 1.5 && Math.random() < 0.01) {
            enemy = { ...enemy, morale: 50, isAggro: false };
          }
        } else if (isAggro) {
          const dx = newPlayer.x - enemy.x;
          const dy = newPlayer.y - enemy.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            moveX = (dx / len) * enemy.speed * deltaTime * 0.06;
            moveY = (dy / len) * enemy.speed * deltaTime * 0.06;
          }
        }

        if (moveX !== 0 || moveY !== 0) {
          const nextX = enemy.x + moveX;
          const nextY = enemy.y + moveY;
          let finalX = enemy.x;
          let finalY = enemy.y;

          // Independent axis collision check for sliding
          if (isWalkable(state.map, nextX, enemy.y, enemy.width, enemy.height)) finalX = nextX;
          if (isWalkable(state.map, finalX, nextY, enemy.width, enemy.height)) finalY = nextY;

          enemy = { ...enemy, x: finalX, y: finalY };
        }

        // 3. Attack Logic
        if (dist < TILE_SIZE && currentTime - enemy.lastAttackTime > enemy.attackCooldown) {
          const dmg = enemy.damage * state.roomModifiers.damageMultiplier;
          newPlayer = {
            ...newPlayer,
            health: Math.max(0, newPlayer.health - dmg),
            lastDamageTime: currentTime
          };
          newStats.damageTaken += dmg;
          enemy = { ...enemy, lastAttackTime: currentTime };

          // Combat Log: Player Damaged
          state.storyLog.push({
            id: generateId(),
            text: `Took ${dmg} damage from ${enemy.type}!`,
            timestamp: Date.now(),
            type: 'combat'
          });
        }

        validEnemies.push({ ...enemy, isAggro: isAggro || enemy.isAggro });
      }
      newEnemies = validEnemies;


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
        };
      }

      // Add combat log if needed - Keeping it removed to focus on Director Logs for now, 
      // or we can add it back if user wants *regular* logs too.
      // User said: "generic simple game updates".
      // Let's re-add basic combat logs but throttle them or keep them simple.
      // For now, I'll assume they mostly meant the AI ones.

      return {
        ...state,
        player: newPlayer,
        enemies: newEnemies,
        fireballs: newFireballs,
        camera: newCamera,
        currentQuests: newQuests,
        coins: newCoins,
        profile: state.profile,
        directorTrigger: combatStarted && !state.directorTrigger ? 'combat_start' : state.directorTrigger,
        visualEffects: activeVisualEffects,
        runStats: newStats
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
      let newQuests = [...state.currentQuests];
      let newLevel = state.level;
      let shouldAdvanceLevel = false;

      for (let i = 0; i < newMilestones.length; i++) {
        const milestone = newMilestones[i];
        if (milestone.collected) continue;

        const dist = distance(state.player, milestone);
        if (dist < milestone.interactionRadius) {
          newMilestones[i] = { ...milestone, collected: true };

          // Update personality
          if (milestone.type === 'treasure' || milestone.type === 'scroll') {
            state.profile = updateProfile(state.profile, { type: 'loot' });
          } else {
            state.profile = updateProfile(state.profile, { type: 'explore' });
          }

          if (milestone.type === 'portal') {
            // Check if all enemies defeated
            if (state.enemies.length === 0) {
              shouldAdvanceLevel = true;
              newLevel = state.level + 1;
              newQuests = newQuests.map((q) =>
                q.id === 'find-portal' ? { ...q, progress: 1, completed: true } : q
              );
            } else {
              newMilestones[i] = { ...milestone, collected: false };
              // Feedback for blocked exit
              state.storyLog = [
                ...state.storyLog,
                {
                  id: generateId(),
                  text: "The portal is sealed! Defeat all enemies to proceed.",
                  timestamp: Date.now(),
                  type: 'danger' as const
                }
              ].slice(-50);
            }
          }

          break;
        }
      }

      if (shouldAdvanceLevel) {
        // Generate new level with AI THEME
        const nextTheme = state.nextTheme || DEFAULT_THEME;
        const newState = createInitialState(newLevel, state.coins, nextTheme);
        return {
          ...newState,
          score: state.score + 1000,
          directorTrigger: 'new_level',
        };
      }

      return {
        ...state,
        milestones: newMilestones,
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
            type: 'danger' as const // Use 'danger' style for Director updates
          }
        ].slice(-50),
      };
    }

    case 'RESET_GAME': {
      return createInitialState(1, 0); // Reset implies 0 gold
    }

    case 'SET_GAME_STATUS': {
      return {
        ...state,
        gameStatus: action.status,
      };
    }

    case 'PURCHASE_ITEM': {
      if (state.coins < action.item.cost) return state; // Should be handled by UI too

      const { item } = action;
      let newPlayer = { ...state.player };

      if (item.type === 'heal') {
        newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + item.value);
      } else {
        // Add effect
        newPlayer.activeEffects = [
          ...newPlayer.activeEffects.filter(e => e.type !== item.type), // Replace existing of same type
          {
            type: item.type as 'speed' | 'damage',
            value: item.value,
            duration: item.duration || 30000,
            startTime: Date.now()
          }
        ];
      }

      return {
        ...state,
        coins: state.coins - item.cost,
        player: newPlayer
      };
    }

    case 'APPLY_AI_ACTION': {
      const { tool, args } = action;
      let newState = { ...state };
      let logText = "";

      switch (tool) {
        case 'spawn_entity': {
          const { type, position, personality } = args;
          // Use player position if no position provided, but offset
          const spawnX = position?.x ? position.x * TILE_SIZE : state.player.x + (Math.random() > 0.5 ? 200 : -200);
          const spawnY = position?.y ? position.y * TILE_SIZE : state.player.y + (Math.random() > 0.5 ? 200 : -200);

          const newEnemy: Enemy = {
            id: generateId(),
            type: type || 'slime',
            x: spawnX,
            y: spawnY,
            width: TILE_SIZE,
            height: TILE_SIZE,
            health: type === 'boss' ? 200 : 50,
            maxHealth: type === 'boss' ? 200 : 50,
            speed: type === 'ghost' ? PLAYER_SPEED * 0.8 : PLAYER_SPEED * 0.5,
            damage: type === 'boss' ? 20 : 10,
            morale: 100,
            attackCooldown: 1000,
            lastAttackTime: 0,
            isAggro: true,
            direction: 'down'
          };

          newState.enemies = [...newState.enemies, newEnemy];
          logText = `Director: Spawning ${type} nearby!`;

          // Add spawn rift effect
          newState.visualEffects = [...newState.visualEffects, {
            id: generateId(),
            x: spawnX,
            y: spawnY,
            type: 'spawn_rift',
            duration: 1500,
            startTime: Date.now(),
            scale: 1
          }];
          break;
        }

        case 'grant_loot': {
          const { rarity, itemType } = args;
          const value = rarity === 'legendary' ? 100 : rarity === 'epic' ? 50 : 20;
          newState.coins = (newState.coins || 0) + value;
          logText = `Director: Granting ${rarity} ${itemType} (+${value} gold)`;
          break;
        }

        case 'modify_room': {
          const { effect, speedMultiplier, damageMultiplier, gravity, visibility } = args;

          newState.roomModifiers = {
            ...newState.roomModifiers,
            speedMultiplier: speedMultiplier ?? newState.roomModifiers.speedMultiplier,
            damageMultiplier: damageMultiplier ?? newState.roomModifiers.damageMultiplier,
            gravity: gravity ?? newState.roomModifiers.gravity,
            visibility: visibility ?? newState.roomModifiers.visibility,
            atmosphere: effect || newState.roomModifiers.atmosphere
          };

          logText = `Director: Room atmosphere shifts... ${effect || 'Physics changed'}`;

          // Visual feedback for room change
          newState.visualEffects = [...newState.visualEffects, {
            id: generateId(),
            x: state.player.x,
            y: state.player.y,
            type: 'curse_aura',
            duration: 2000,
            startTime: Date.now(),
            scale: 100 // Global effect
          }];
          break;
        }

        case 'social_interaction': {
          const { target, intent, success } = args;

          if (success) {
            newState.enemies = newState.enemies.map(e => ({
              ...e,
              isAggro: false,
              morale: 0
            }));
            newState.score += 50;
            state.profile = updateProfile(state.profile, { type: 'talk' });
            logText = `Social Success: Enemies calmed down.`;
          } else {
            newState.enemies = newState.enemies.map(e => ({
              ...e,
              isAggro: true,
              speed: e.speed * 1.2,
              morale: 100
            }));
            state.profile = updateProfile(state.profile, { type: 'kill' });
            logText = `Social Failed: Enemies enraged!`;
          }
          break;
        }

        case 'create_quest': {
          const { title, description, target_count, reward_gold } = args;
          const newQuest = {
            id: generateId(),
            title,
            description,
            completed: false,
            progress: 0,
            target: target_count,
            reward: { gold: reward_gold }
          };
          newState.currentQuests = [...newState.currentQuests, newQuest];
          logText = `New Quest: ${title}`;
          break;
        }

        case 'set_theme': {
          const { themeName, visualStyle, corridorWidth, enemyDensity } = args;
          const newTheme: DungeonTheme = {
            name: themeName || 'Unknown Depths',
            description: 'The Director has altered reality.',
            corridorWidth: corridorWidth || 2,
            roomSizeBias: 'standard',
            enemyDensity: enemyDensity || 1.0,
            specialFeature: 'none',
            visualStyle: visualStyle || 'stone'
          };
          newState.nextTheme = newTheme;
          logText = `Director: The path ahead shifts to ${themeName}...`;
          break;
        }
      }

      if (logText) {
        newState.storyLog = [
          ...newState.storyLog,
          {
            id: generateId(),
            text: logText,
            timestamp: Date.now(),
            type: 'danger' as const // Use 'danger' style for Director updates
          }
        ].slice(-50);
      }

      return newState;
    }

    case 'CLEAR_DIRECTOR_TRIGGER': {
      return {
        ...state,
        directorTrigger: null
      };
    }

    case 'SET_NEXT_THEME': {
      return {
        ...state,
        nextTheme: action.theme
      };
    }

    case 'ADD_VISUAL_EFFECT': {
      const { effect } = action;
      return {
        ...state,
        visualEffects: [...state.visualEffects, { ...effect, startTime: Date.now() }]
      };
    }

    default:
      return state;
  }
}

export function useGameEngine(initialLevel: number = 1, initialGold: number = 0) {
  const [state, dispatch] = useReducer(gameReducer, null, () => createInitialState(initialLevel, initialGold));
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

    const controls = controlsRef.current;
    if (controls.up) dispatch({ type: 'MOVE_PLAYER', direction: 'up' });
    if (controls.down) dispatch({ type: 'MOVE_PLAYER', direction: 'down' });
    if (controls.left) dispatch({ type: 'MOVE_PLAYER', direction: 'left' });
    if (controls.right) dispatch({ type: 'MOVE_PLAYER', direction: 'right' });

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

  const applyAIAction = useCallback((tool: string, args: any) => {
    dispatch({ type: 'APPLY_AI_ACTION', tool, args });
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
    applyAIAction
  };
}
