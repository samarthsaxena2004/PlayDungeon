'use client';

import { useMemo, useState } from 'react';
import type { GameState } from '@/games/dungeon/lib/game-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MinimapProps {
  state: GameState;
}

export function Minimap({ state }: MinimapProps) {
  const { map, player, enemies, milestones } = state;
  const [isExpanded, setIsExpanded] = useState(false);

  // Scale varies based on expanded state
  const scale = isExpanded ? 6 : 3;
  const width = map.width * scale;
  const height = map.height * scale;

  const floorTiles = useMemo(() => {
    const tiles: { x: number; y: number }[] = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tiles[y][x].walkable) {
          tiles.push({ x, y });
        }
      }
    }
    return tiles;
  }, [map]);

  const playerPos = {
    x: Math.floor(player.x / map.tileSize) * scale,
    y: Math.floor(player.y / map.tileSize) * scale,
  };

  return (
    <>
      {/* Overlay Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`fixed z-50 transition-all duration-300 cursor-pointer ${isExpanded
          ? 'inset-0 flex items-center justify-center pointer-events-none' // Centering container
          : 'top-4 right-4'
          }`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <motion.div
          layout
          className={`
            relative bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden
            ${isExpanded ? 'p-4 pointer-events-auto bg-black/90 border-primary/50' : 'p-2 hover:border-primary/50'}
          `}
          onClick={(e) => isExpanded && e.stopPropagation()} // Prevent closing when clicking map itself
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {isExpanded ? 'Full Map' : 'Minimap (Click to expand)'}
            </div>
            {isExpanded && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div
            className="relative bg-background/50 rounded overflow-hidden"
            style={{ width, height }}
          >
            {/* Floor tiles */}
            {floorTiles.map((tile, i) => (
              <div
                key={i}
                className="absolute bg-muted/40"
                style={{
                  left: tile.x * scale,
                  top: tile.y * scale,
                  width: scale,
                  height: scale,
                }}
              />
            ))}

            {/* Milestones */}
            {milestones.map((milestone) => {
              if (milestone.collected) return null;
              const mX = Math.floor(milestone.x / map.tileSize) * scale;
              const mY = Math.floor(milestone.y / map.tileSize) * scale;
              return (
                <div
                  key={milestone.id}
                  className={`absolute rounded-full ${milestone.type === 'portal'
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-yellow-400'
                    }`}
                  style={{
                    left: mX,
                    top: mY,
                    width: scale + 1,
                    height: scale + 1,
                  }}
                />
              );
            })}

            {/* Enemies */}
            {enemies.map((enemy) => {
              const eX = Math.floor(enemy.x / map.tileSize) * scale;
              const eY = Math.floor(enemy.y / map.tileSize) * scale;
              return (
                <div
                  key={enemy.id}
                  className={`absolute rounded-full ${enemy.type === 'boss'
                    ? 'bg-red-500 w-2 h-2'
                    : 'bg-enemy'
                    }`}
                  style={{
                    left: eX,
                    top: eY,
                    width: enemy.type === 'boss' ? scale * 2 : scale,
                    height: enemy.type === 'boss' ? scale * 2 : scale,
                  }}
                />
              );
            })}

            {/* Player */}
            <div
              className="absolute bg-health rounded-full animate-pulse z-10 box-content border border-black/30"
              style={{
                left: playerPos.x - 1,
                top: playerPos.y - 1,
                width: scale + 2,
                height: scale + 2,
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
