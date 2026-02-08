import type { GameMap, Tile, Enemy, Milestone, Position } from './game-types';
import { DungeonTheme, DEFAULT_THEME } from './director-config';

function createTile(x: number, y: number, type: Tile['type'], style: string = 'stone'): Tile {
  return {
    x,
    y,
    type,
    walkable: type === 'floor' || type === 'door' || type === 'spawn',
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Procedural dungeon generation using cellular automata + room placement
export function generateDungeonMap(
  width: number,
  height: number,
  tileSize: number,
  level: number,
  theme: DungeonTheme = DEFAULT_THEME
): { map: GameMap; spawnPoint: Position; enemies: Enemy[]; milestones: Milestone[] } {
  const tiles: Tile[][] = [];

  // Initialize with walls
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = createTile(x, y, 'wall', theme.visualStyle);
    }
  }

  // Generate rooms based on Theme Size Bias
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const numRooms = 6 + Math.floor(Math.min(level, 10) * 0.5);

  let minRoomSize = 5;
  let maxRoomExtra = 6;

  if (theme.roomSizeBias === 'small') {
    minRoomSize = 3;
    maxRoomExtra = 4;
  } else if (theme.roomSizeBias === 'large') {
    minRoomSize = 7;
    maxRoomExtra = 8;
  }

  for (let i = 0; i < numRooms; i++) {
    const roomWidth = minRoomSize + Math.floor(Math.random() * maxRoomExtra);
    const roomHeight = minRoomSize + Math.floor(Math.random() * maxRoomExtra);
    const roomX = 2 + Math.floor(Math.random() * (width - roomWidth - 4));
    const roomY = 2 + Math.floor(Math.random() * (height - roomHeight - 4));

    // Check for overlap
    let overlaps = false;
    for (const room of rooms) {
      if (
        roomX < room.x + room.w + 2 &&
        roomX + roomWidth + 2 > room.x &&
        roomY < room.y + room.h + 2 &&
        roomY + roomHeight + 2 > room.y
      ) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      rooms.push({ x: roomX, y: roomY, w: roomWidth, h: roomHeight });

      // Carve out the room
      for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
          if (y >= 0 && y < height && x >= 0 && x < width) {
            tiles[y][x] = createTile(x, y, 'floor', theme.visualStyle);
          }
        }
      }
    }
  }

  // Connect rooms with corridors based on Theme Corridor Width
  const corridorWidth = theme.corridorWidth;

  for (let i = 1; i < rooms.length; i++) {
    const prevRoom = rooms[i - 1];
    const currentRoom = rooms[i];

    const prevCenterX = Math.floor(prevRoom.x + prevRoom.w / 2);
    const prevCenterY = Math.floor(prevRoom.y + prevRoom.h / 2);
    const currCenterX = Math.floor(currentRoom.x + currentRoom.w / 2);
    const currCenterY = Math.floor(currentRoom.y + currentRoom.h / 2);

    // Create L-shaped corridor
    if (Math.random() > 0.5) {
      // Horizontal then vertical
      for (let x = Math.min(prevCenterX, currCenterX); x <= Math.max(prevCenterX, currCenterX); x++) {
        for (let w = 0; w < corridorWidth; w++) {
          const cy = prevCenterY + w;
          if (cy >= 0 && cy < height && x >= 0 && x < width) {
            tiles[cy][x] = createTile(x, cy, 'floor', theme.visualStyle);
          }
        }
      }
      for (let y = Math.min(prevCenterY, currCenterY); y <= Math.max(prevCenterY, currCenterY); y++) {
        for (let w = 0; w < corridorWidth; w++) {
          const cx = currCenterX + w;
          if (y >= 0 && y < height && cx >= 0 && cx < width) {
            tiles[y][cx] = createTile(cx, y, 'floor', theme.visualStyle);
          }
        }
      }
    } else {
      // Vertical then horizontal
      for (let y = Math.min(prevCenterY, currCenterY); y <= Math.max(prevCenterY, currCenterY); y++) {
        for (let w = 0; w < corridorWidth; w++) {
          const cx = prevCenterX + w;
          if (y >= 0 && y < height && cx >= 0 && cx < width) {
            tiles[y][cx] = createTile(cx, y, 'floor', theme.visualStyle);
          }
        }
      }
      for (let x = Math.min(prevCenterX, currCenterX); x <= Math.max(prevCenterX, currCenterX); x++) {
        for (let w = 0; w < corridorWidth; w++) {
          const cy = currCenterY + w;
          if (cy >= 0 && cy < height && x >= 0 && x < width) {
            tiles[cy][x] = createTile(x, cy, 'floor', theme.visualStyle);
          }
        }
      }
    }
  }

  // Set spawn point in first room
  const spawnRoom = rooms[0];
  const spawnX = (spawnRoom.x + Math.floor(spawnRoom.w / 2)) * tileSize;
  const spawnY = (spawnRoom.y + Math.floor(spawnRoom.h / 2)) * tileSize;
  tiles[Math.floor(spawnY / tileSize)][Math.floor(spawnX / tileSize)] = createTile(
    Math.floor(spawnX / tileSize),
    Math.floor(spawnY / tileSize),
    'spawn',
    theme.visualStyle
  );

  // Generate enemies in rooms (not the first room)
  // Enemy generation logic
  const enemies: Enemy[] = [];

  // Define available enemy types based on level
  const availableTypes: Enemy['type'][] = ['slime'];
  if (level >= 2) availableTypes.push('skeleton');
  if (level >= 4) availableTypes.push('ghost');

  // Calculate total number of enemies for the level with THEME DENSITY
  const baseEnemyCount = Math.floor(1 + (level - 1) * 1.5);
  const maxEnemyCount = Math.floor(1 + (level - 1) * 2);
  let totalEnemiesToSpawn = level === 1 ? 1 : Math.floor(baseEnemyCount + Math.random() * (maxEnemyCount - baseEnemyCount + 1));

  // Apply AI Theme Density
  totalEnemiesToSpawn = Math.max(1, Math.floor(totalEnemiesToSpawn * theme.enemyDensity));

  // Distribute enemies among rooms (skipping spawn room)
  const spawnableRooms = rooms.slice(1); // Exclude first room

  for (let i = 0; i < totalEnemiesToSpawn; i++) {
    if (spawnableRooms.length === 0) break;

    // Pick a random room
    const room = spawnableRooms[Math.floor(Math.random() * spawnableRooms.length)];

    const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const enemyX = (room.x + 1 + Math.floor(Math.random() * (room.w - 2))) * tileSize;
    const enemyY = (room.y + 1 + Math.floor(Math.random() * (room.h - 2))) * tileSize;

    enemies.push({
      id: generateId(),
      x: enemyX,
      y: enemyY,
      width: tileSize * 0.8,
      height: tileSize * 0.8,
      health: getEnemyHealth(enemyType, level),
      maxHealth: getEnemyHealth(enemyType, level),
      type: enemyType,
      speed: getEnemySpeed(enemyType),
      damage: getEnemyDamage(enemyType, level),
      isAggro: false,
      lastAttackTime: 0,
      attackCooldown: getEnemyAttackCooldown(enemyType),
      morale: 100,
    });
  }

  // Add a boss in the last room (only for level 3+)
  if (rooms.length > 2 && level >= 3) {
    const bossRoom = rooms[rooms.length - 1];
    const bossX = (bossRoom.x + Math.floor(bossRoom.w / 2)) * tileSize;
    const bossY = (bossRoom.y + Math.floor(bossRoom.h / 2)) * tileSize;

    enemies.push({
      id: generateId(),
      x: bossX,
      y: bossY,
      width: tileSize * 1.5,
      height: tileSize * 1.5,
      health: 100 + level * 50,
      maxHealth: 100 + level * 50,
      type: 'boss',
      speed: 1.5,
      damage: 20 + level * 5,
      isAggro: false,
      lastAttackTime: 0,
      attackCooldown: 1500,
      morale: 100,
    });
  }

  // Generate milestones
  const milestones: Milestone[] = [];
  const milestoneTypes: Milestone['type'][] = ['key', 'treasure', 'scroll', 'npc'];
  const storyTriggers = [
    'You found an ancient key. It pulses with dark energy...',
    'A chest filled with gold! But what lurks nearby?',
    'An old scroll reveals the dungeon\'s dark history.',
    'A mysterious figure appears before you.',
    'A portal shimmers in the darkness. Dare you enter?',
  ];

  for (let i = 1; i < rooms.length - 1; i++) {
    if (Math.random() > 0.5) {
      const room = rooms[i];
      const mType = milestoneTypes[Math.floor(Math.random() * milestoneTypes.length)];
      const mX = (room.x + 1 + Math.floor(Math.random() * (room.w - 2))) * tileSize;
      const mY = (room.y + 1 + Math.floor(Math.random() * (room.h - 2))) * tileSize;

      milestones.push({
        id: generateId(),
        x: mX,
        y: mY,
        width: tileSize * 0.6,
        height: tileSize * 0.6,
        type: mType,
        collected: false,
        storyTrigger: storyTriggers[Math.floor(Math.random() * storyTriggers.length)],
        interactionRadius: tileSize * 1.5,
      });
    }
  }

  // Add portal in last room
  const lastRoom = rooms[rooms.length - 1];
  milestones.push({
    id: generateId(),
    x: (lastRoom.x + Math.floor(lastRoom.w / 2)) * tileSize,
    y: (lastRoom.y + 1) * tileSize,
    width: tileSize,
    height: tileSize,
    type: 'portal',
    collected: false,
    storyTrigger: 'The portal to the next level opens!',
    interactionRadius: tileSize * 2,
  });

  return {
    map: { width, height, tileSize, tiles },
    spawnPoint: { x: spawnX, y: spawnY },
    enemies,
    milestones,
  };
}

function getEnemyHealth(type: string, level: number): number {
  // Drastically reduced health for Level 1 Slimes
  const base: Record<string, number> = { slime: 20, skeleton: 50, ghost: 40, boss: 150 };
  const scaling: Record<string, number> = { slime: 5, skeleton: 10, ghost: 10, boss: 50 };
  return (base[type] || base['slime']) + (level - 1) * (scaling[type] || scaling['slime']);
}

function getEnemySpeed(type: string): number {
  const speeds: Record<string, number> = { slime: 0.8, skeleton: 1.8, ghost: 2.2, boss: 1.5 };
  return speeds[type] || speeds['slime'];
}

function getEnemyDamage(type: string, level: number): number {
  // Very low damage for Level 1
  const base: Record<string, number> = { slime: 3, skeleton: 10, ghost: 8, boss: 25 };
  const scaling: Record<string, number> = { slime: 1, skeleton: 2, ghost: 2, boss: 5 };
  return (base[type] || base['slime']) + (level - 1) * (scaling[type] || scaling['slime']);
}

function getEnemyAttackCooldown(type: string): number {
  // Slower attacks for slimes
  const cooldowns: Record<string, number> = { slime: 2500, skeleton: 1500, ghost: 1000, boss: 1200 };
  return cooldowns[type] || cooldowns['slime'];
}

export function isWalkable(map: GameMap, x: number, y: number, width: number, height: number): boolean {
  const tileSize = map.tileSize;

  // Check all corners of the entity
  const corners = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x, y: y + height },
    { x: x + width, y: y + height },
  ];

  for (const corner of corners) {
    const tileX = Math.floor(corner.x / tileSize);
    const tileY = Math.floor(corner.y / tileSize);

    if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
      return false;
    }

    if (!map.tiles[tileY][tileX].walkable) {
      return false;
    }
  }

  return true;
}
