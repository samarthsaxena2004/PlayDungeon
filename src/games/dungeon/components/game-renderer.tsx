'use client';

import { useRef, useEffect, memo } from 'react';
import type { GameState } from '@/games/dungeon/lib/game-types';

interface GameRendererProps {
  state: GameState;
  remotePlayers?: Record<string, { x: number; y: number; id: string }>;
}

const COLORS = {
  floor: '#1a1a2e',
  wall: '#0f0f1a',
  door: '#2d2d44',
  spawn: '#1e3a1e',
  pit: '#050508',
  player: '#4ade80',
  playerGlow: 'rgba(74, 222, 128, 0.3)',
  enemy: {
    slime: '#a855f7',
    skeleton: '#f5f5f5',
    ghost: '#60a5fa',
    boss: '#ef4444',
  },
  fireball: '#f97316',
  fireballGlow: 'rgba(249, 115, 22, 0.5)',
  milestone: {
    key: '#fbbf24',
    treasure: '#fbbf24',
    scroll: '#a3e635',
    portal: '#06b6d4',
    npc: '#e879f9',
  },
  grid: 'rgba(255, 255, 255, 0.03)',
  healthBar: '#22c55e',
  healthBarBg: '#3f3f46',
};

function GameRendererComponent({ state }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

}, [state]);

// Draw remote players
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas || !remotePlayers) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // We need to redraw everything or overlay? 
  // Actually, drawing them in the main loop is better to avoid clearing issues.
  // But since the main loop is in the other useEffect, let's just combine them or trigger re-render.
  // However, for simplicity now, let's just make sure the MAIN useEffect depends on remotePlayers too.
}, [remotePlayers]);

// COMPLETE REWRITE OF THE RENDER EFFECT TO INCLUDE REMOTE PLAYERS
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  // Clear canvas
  ctx.fillStyle = COLORS.pit;
  ctx.fillRect(0, 0, rect.width, rect.height);

  const { map, player, enemies, fireballs, milestones, camera } = state;
  const { tileSize, tiles } = map;

  // ... existing drawing code ...
  // Calculate visible area
  const startTileX = Math.max(0, Math.floor(camera.x / tileSize) - 1);
  const startTileY = Math.max(0, Math.floor(camera.y / tileSize) - 1);
  const endTileX = Math.min(map.width, Math.ceil((camera.x + rect.width) / tileSize) + 1);
  const endTileY = Math.min(map.height, Math.ceil((camera.y + rect.height) / tileSize) + 1);

  // Draw tiles
  for (let y = startTileY; y < endTileY; y++) {
    for (let x = startTileX; x < endTileX; x++) {
      const tile = tiles[y]?.[x];
      if (!tile) continue;

      const screenX = x * tileSize - camera.x;
      const screenY = y * tileSize - camera.y;

      ctx.fillStyle = COLORS[tile.type] || COLORS.floor;
      ctx.fillRect(screenX, screenY, tileSize, tileSize);

      if (tile.walkable) {
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);
      }

      if (tile.type === 'wall') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let i = 0; i < 3; i++) {
          const brickX = screenX + Math.random() * (tileSize - 8);
          const brickY = screenY + Math.random() * (tileSize - 4);
          ctx.fillRect(brickX, brickY, 8, 4);
        }
      }
    }
  }

  // Draw Remote Players (UNDER TILES? NO, ABOVE TILES)
  if (remotePlayers) {
    Object.values(remotePlayers).forEach(p => {
      if (p.id === 'myself') return; // redundant check if we rely on sender id

      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;

      if (screenX < -50 || screenX > rect.width + 50 || screenY < -50 || screenY > rect.height + 50) return;

      // Simple blue circle for now
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(screenX + tileSize / 2, screenY + tileSize / 2, tileSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Name
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.id.substring(0, 6), screenX + tileSize / 2, screenY - 5);
    });
  }

  // ... continue with milestones, fireballs, enemies, player ...
  // Draw milestones
  for (const milestone of milestones) {
    if (milestone.collected) continue;
    // ... (abbreviated for tool call, I will try to swap the whole useEffect or just inject the code block)

    const screenX = milestone.x - camera.x;
    const screenY = milestone.y - camera.y;

    if (screenX < -50 || screenX > rect.width + 50 || screenY < -50 || screenY > rect.height + 50) continue;

    // Draw milestone
    const gradient = ctx.createRadialGradient(
      screenX + milestone.width / 2, screenY + milestone.height / 2, 0,
      screenX + milestone.width / 2, screenY + milestone.height / 2, tileSize
    );
    gradient.addColorStop(0, `${COLORS.milestone[milestone.type]}44`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX + milestone.width / 2, screenY + milestone.height / 2, tileSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.milestone[milestone.type];

    if (milestone.type === 'portal') {
      // ...
      ctx.beginPath(); ctx.arc(screenX + milestone.width / 2, screenY + milestone.height / 2, milestone.width / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(screenX + milestone.width / 2, screenY + milestone.height / 2, milestone.width / 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Draw fireballs
  for (const fireball of fireballs) {
    // ... (standard drawing)
    const screenX = fireball.x - camera.x;
    const screenY = fireball.y - camera.y;
    ctx.fillStyle = COLORS.fireball;
    ctx.beginPath(); ctx.arc(screenX + fireball.width / 2, screenY + fireball.height / 2, 5, 0, Math.PI * 2); ctx.fill();
  }

  // Draw enemies
  for (const enemy of enemies) {
    const screenX = enemy.x - camera.x;
    const screenY = enemy.y - camera.y;
    if (screenX < -50 || screenX > rect.width + 50 || screenY < -50 || screenY > rect.height + 50) continue;
    ctx.fillStyle = COLORS.enemy[enemy.type];
    ctx.beginPath(); ctx.arc(screenX + enemy.width / 2, screenY + enemy.height / 2, enemy.width / 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // Draw player
  const playerScreenX = player.x - camera.x;
  const playerScreenY = player.y - camera.y;

  // Player glow
  const playerGradient = ctx.createRadialGradient(playerScreenX + player.width / 2, playerScreenY + player.height / 2, 0, playerScreenX + player.width / 2, playerScreenY + player.height / 2, tileSize);
  playerGradient.addColorStop(0, COLORS.playerGlow); playerGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = playerGradient; ctx.beginPath(); ctx.arc(playerScreenX + player.width / 2, playerScreenY + player.height / 2, tileSize, 0, Math.PI * 2); ctx.fill();

  // Player body
  ctx.fillStyle = COLORS.player;
  ctx.beginPath(); ctx.arc(playerScreenX + player.width / 2, playerScreenY + player.height / 2, player.width / 2.2, 0, Math.PI * 2); ctx.fill();

  // Scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  for (let i = 0; i < rect.height; i += 4) { ctx.fillRect(0, i, rect.width, 2); }

  // Vignette
  const vignette = ctx.createRadialGradient(rect.width / 2, rect.height / 2, rect.width / 3, rect.width / 2, rect.height / 2, rect.width);
  vignette.addColorStop(0, 'transparent'); vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, rect.width, rect.height);

}, [state, remotePlayers]);

return (
  <canvas
    ref={canvasRef}
    className="w-full h-full"
    style={{ imageRendering: 'pixelated' }}
  />
);
}

export const GameRenderer = memo(GameRendererComponent);
