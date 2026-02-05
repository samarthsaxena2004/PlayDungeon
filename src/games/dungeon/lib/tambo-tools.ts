import { z } from 'zod';
import type { TamboTool } from '@tambo-ai/react';

// ============================================
// GAME CONTROL TOOLS
// These tools allow the AI to trigger game actions
// ============================================

export const createGameTools = (
  onAttack: () => void,
  onInteract: () => void,
  onToggleMute: () => void,
  gameState: {
    health: number;
    level: number;
    score: number;
    enemies: number;
  }
): TamboTool[] => [
    {
      name: 'triggerAttack',
      description: 'Triggers the player to shoot a fireball in their current facing direction. Use when user says "attack", "shoot", "fire", or wants to attack enemies.',
      inputSchema: z.object({
        reason: z.string().describe('Why the attack is being triggered'),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        action: z.string(),
        reason: z.string(),
      }),
      tool: async ({ reason }) => {
        onAttack();
        return { success: true, action: 'attack', reason };
      },
    },
    {
      name: 'triggerInteract',
      description: 'Triggers interaction with nearby objects, NPCs, or items. Use when user says "interact", "talk", "pick up", "use", or "open".',
      inputSchema: z.object({
        target: z.string().describe('What the player wants to interact with'),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        action: z.string(),
        target: z.string(),
      }),
      tool: async ({ target }) => {
        onInteract();
        return { success: true, action: 'interact', target };
      },
    },
    {
      name: 'toggleGameSound',
      description: 'Toggles the game sound/music on or off. Use when user says "mute", "unmute", "sound off", "music off", or "toggle sound".',
      inputSchema: z.object({
        action: z.enum(['mute', 'unmute', 'toggle']).describe('What to do with sound'),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        action: z.string(),
        result: z.string(),
      }),
      tool: async ({ action }) => {
        onToggleMute();
        return { success: true, action: 'sound', result: action };
      },
    },
    {
      name: 'getGameState',
      description: 'Gets the current game state including health, level, score, and enemy count. Use when needing current game data to provide advice.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        health: z.number(),
        level: z.number(),
        score: z.number(),
        enemiesNearby: z.number(),
      }),
      tool: async () => {
        return {
          health: gameState.health,
          level: gameState.level,
          score: gameState.score,
          enemiesNearby: gameState.enemies,
        };
      },
    },
  ];

// ============================================
// CONTEXT HELPERS
// Provide dynamic context about the game state
// ============================================

export const createContextHelpers = (gameState: {
  health: number;
  maxHealth: number;
  level: number;
  score: number;
  enemiesNearby: number;
  currentQuest: string;
  enemiesDefeated: number;
  playerName?: string;
}) => ({
  currentHealth: () => `${gameState.health}/${gameState.maxHealth}`,
  healthStatus: () => gameState.health < 30 ? 'CRITICAL' : gameState.health < 60 ? 'LOW' : 'HEALTHY',
  currentLevel: () => gameState.level,
  playerScore: () => gameState.score,
  nearbyThreats: () => gameState.enemiesNearby,
  activeQuest: () => gameState.currentQuest,
  killCount: () => gameState.enemiesDefeated,
  dangerLevel: () => gameState.enemiesNearby > 3 ? 'HIGH' : gameState.enemiesNearby > 0 ? 'MEDIUM' : 'SAFE',
  adventurerName: () => gameState.playerName || 'Adventurer',
});
