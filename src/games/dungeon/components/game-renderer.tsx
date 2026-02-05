'use client';

import { useRef, useEffect, memo } from 'react';
import type { GameState } from '@/games/dungeon/lib/game-types';

interface GameRendererProps {
  state: GameState;
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
        
        // Draw tile
        ctx.fillStyle = COLORS[tile.type] || COLORS.floor;
        ctx.fillRect(screenX, screenY, tileSize, tileSize);
        
        // Draw grid lines on floor
        if (tile.walkable) {
          ctx.strokeStyle = COLORS.grid;
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        }
        
        // Add subtle texture to walls
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
    
    // Draw milestones
    for (const milestone of milestones) {
      if (milestone.collected) continue;
      
      const screenX = milestone.x - camera.x;
      const screenY = milestone.y - camera.y;
      
      // Skip if off screen
      if (screenX < -50 || screenX > rect.width + 50 || screenY < -50 || screenY > rect.height + 50) {
        continue;
      }
      
      // Draw glow
      const gradient = ctx.createRadialGradient(
        screenX + milestone.width / 2,
        screenY + milestone.height / 2,
        0,
        screenX + milestone.width / 2,
        screenY + milestone.height / 2,
        tileSize
      );
      gradient.addColorStop(0, `${COLORS.milestone[milestone.type]}44`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX + milestone.width / 2, screenY + milestone.height / 2, tileSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw milestone
      ctx.fillStyle = COLORS.milestone[milestone.type];
      
      if (milestone.type === 'portal') {
        // Animated portal
        const time = Date.now() / 500;
        ctx.save();
        ctx.translate(screenX + milestone.width / 2, screenY + milestone.height / 2);
        ctx.rotate(time);
        ctx.beginPath();
        ctx.arc(0, 0, milestone.width / 2, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.milestone.portal;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, milestone.width / 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        // Simple shapes for other milestones
        ctx.beginPath();
        if (milestone.type === 'key') {
          ctx.arc(screenX + milestone.width / 2, screenY + milestone.height / 2, milestone.width / 2, 0, Math.PI * 2);
        } else if (milestone.type === 'treasure') {
          ctx.rect(screenX, screenY, milestone.width, milestone.height);
        } else {
          ctx.arc(screenX + milestone.width / 2, screenY + milestone.height / 2, milestone.width / 2, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
    
    // Draw fireballs
    for (const fireball of fireballs) {
      const screenX = fireball.x - camera.x;
      const screenY = fireball.y - camera.y;
      
      // Skip if off screen
      if (screenX < -20 || screenX > rect.width + 20 || screenY < -20 || screenY > rect.height + 20) {
        continue;
      }
      
      // Draw glow
      const gradient = ctx.createRadialGradient(
        screenX + fireball.width / 2,
        screenY + fireball.height / 2,
        0,
        screenX + fireball.width / 2,
        screenY + fireball.height / 2,
        20
      );
      gradient.addColorStop(0, COLORS.fireball);
      gradient.addColorStop(0.5, COLORS.fireballGlow);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX + fireball.width / 2, screenY + fireball.height / 2, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw core
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(screenX + fireball.width / 2, screenY + fireball.height / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw enemies
    for (const enemy of enemies) {
      const screenX = enemy.x - camera.x;
      const screenY = enemy.y - camera.y;
      
      // Skip if off screen
      if (screenX < -50 || screenX > rect.width + 50 || screenY < -50 || screenY > rect.height + 50) {
        continue;
      }
      
      // Draw enemy body
      ctx.fillStyle = COLORS.enemy[enemy.type];
      
      if (enemy.type === 'slime') {
        // Blob shape
        ctx.beginPath();
        const wobble = Math.sin(Date.now() / 200) * 2;
        ctx.ellipse(
          screenX + enemy.width / 2,
          screenY + enemy.height / 2 + wobble,
          enemy.width / 2,
          enemy.height / 2.5,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else if (enemy.type === 'skeleton') {
        // Skull shape
        ctx.beginPath();
        ctx.arc(screenX + enemy.width / 2, screenY + enemy.height / 2, enemy.width / 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(screenX + enemy.width / 3, screenY + enemy.height / 2.5, 3, 0, Math.PI * 2);
        ctx.arc(screenX + enemy.width * 2 / 3, screenY + enemy.height / 2.5, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === 'ghost') {
        // Ghost shape with transparency
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(screenX + enemy.width / 2, screenY + enemy.height / 3, enemy.width / 2.5, Math.PI, 0);
        ctx.lineTo(screenX + enemy.width, screenY + enemy.height);
        // Wavy bottom
        const waveTime = Date.now() / 300;
        for (let i = 0; i < 4; i++) {
          const waveX = screenX + enemy.width - (enemy.width / 4) * i;
          const waveY = screenY + enemy.height + Math.sin(waveTime + i) * 3;
          ctx.lineTo(waveX, waveY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (enemy.type === 'boss') {
        // Larger, menacing shape
        ctx.save();
        ctx.shadowColor = COLORS.enemy.boss;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(screenX + enemy.width / 2, screenY + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();
        // Inner eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(screenX + enemy.width / 2, screenY + enemy.height / 2, enemy.width / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screenX + enemy.width / 2, screenY + enemy.height / 2, enemy.width / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // Draw health bar for damaged enemies
      if (enemy.health < enemy.maxHealth) {
        const barWidth = enemy.width;
        const barHeight = 4;
        const barX = screenX;
        const barY = screenY - 10;
        
        ctx.fillStyle = COLORS.healthBarBg;
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = enemy.type === 'boss' ? COLORS.enemy.boss : COLORS.healthBar;
        ctx.fillRect(barX, barY, barWidth * (enemy.health / enemy.maxHealth), barHeight);
      }
      
      // Aggro indicator
      if (enemy.isAggro) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('!', screenX + enemy.width / 2 - 3, screenY - 15);
      }
    }
    
    // Draw player
    const playerScreenX = player.x - camera.x;
    const playerScreenY = player.y - camera.y;
    
    // Player glow
    const playerGradient = ctx.createRadialGradient(
      playerScreenX + player.width / 2,
      playerScreenY + player.height / 2,
      0,
      playerScreenX + player.width / 2,
      playerScreenY + player.height / 2,
      tileSize
    );
    playerGradient.addColorStop(0, COLORS.playerGlow);
    playerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = playerGradient;
    ctx.beginPath();
    ctx.arc(playerScreenX + player.width / 2, playerScreenY + player.height / 2, tileSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Player body (Among Us style)
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    // Body
    ctx.ellipse(
      playerScreenX + player.width / 2,
      playerScreenY + player.height * 0.6,
      player.width / 2.2,
      player.height / 2.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Visor
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    const visorOffset = player.direction === 'left' ? -4 : player.direction === 'right' ? 4 : 0;
    ctx.ellipse(
      playerScreenX + player.width / 2 + visorOffset,
      playerScreenY + player.height * 0.45,
      player.width / 4,
      player.height / 6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Visor shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
      playerScreenX + player.width / 2 + visorOffset - 2,
      playerScreenY + player.height * 0.42,
      player.width / 8,
      player.height / 12,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Direction indicator (small triangle)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    switch (player.direction) {
      case 'up':
        ctx.moveTo(playerScreenX + player.width / 2, playerScreenY - 5);
        ctx.lineTo(playerScreenX + player.width / 2 - 5, playerScreenY + 3);
        ctx.lineTo(playerScreenX + player.width / 2 + 5, playerScreenY + 3);
        break;
      case 'down':
        ctx.moveTo(playerScreenX + player.width / 2, playerScreenY + player.height + 5);
        ctx.lineTo(playerScreenX + player.width / 2 - 5, playerScreenY + player.height - 3);
        ctx.lineTo(playerScreenX + player.width / 2 + 5, playerScreenY + player.height - 3);
        break;
      case 'left':
        ctx.moveTo(playerScreenX - 5, playerScreenY + player.height / 2);
        ctx.lineTo(playerScreenX + 3, playerScreenY + player.height / 2 - 5);
        ctx.lineTo(playerScreenX + 3, playerScreenY + player.height / 2 + 5);
        break;
      case 'right':
        ctx.moveTo(playerScreenX + player.width + 5, playerScreenY + player.height / 2);
        ctx.lineTo(playerScreenX + player.width - 3, playerScreenY + player.height / 2 - 5);
        ctx.lineTo(playerScreenX + player.width - 3, playerScreenY + player.height / 2 + 5);
        break;
    }
    ctx.closePath();
    ctx.fill();
    
    // CRT scanline effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < rect.height; i += 4) {
      ctx.fillRect(0, i, rect.width, 2);
    }
    
    // Vignette effect
    const vignette = ctx.createRadialGradient(
      rect.width / 2,
      rect.height / 2,
      rect.width / 3,
      rect.width / 2,
      rect.height / 2,
      rect.width
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
  }, [state]);
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

export const GameRenderer = memo(GameRendererComponent);
