import type { GameMap, Tile, Enemy, Milestone, Position } from './game-types';

function createTile(x: number, y: number, type: Tile['type']): Tile {
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
  level: number
): { map: GameMap; spawnPoint: Position; enemies: Enemy[]; milestones: Milestone[] } {
  const tiles: Tile[][] = [];
  
  // Initialize with walls
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = createTile(x, y, 'wall');
    }
  }
  
  // Generate rooms
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const numRooms = 6 + Math.floor(level * 1.5);
  
  for (let i = 0; i < numRooms; i++) {
    const roomWidth = 5 + Math.floor(Math.random() * 6);
    const roomHeight = 5 + Math.floor(Math.random() * 6);
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
            tiles[y][x] = createTile(x, y, 'floor');
          }
        }
      }
    }
  }
  
  // Connect rooms with corridors
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
        if (prevCenterY >= 0 && prevCenterY < height && x >= 0 && x < width) {
          tiles[prevCenterY][x] = createTile(x, prevCenterY, 'floor');
          // Make corridor 2 tiles wide
          if (prevCenterY + 1 < height) {
            tiles[prevCenterY + 1][x] = createTile(x, prevCenterY + 1, 'floor');
          }
        }
      }
      for (let y = Math.min(prevCenterY, currCenterY); y <= Math.max(prevCenterY, currCenterY); y++) {
        if (y >= 0 && y < height && currCenterX >= 0 && currCenterX < width) {
          tiles[y][currCenterX] = createTile(currCenterX, y, 'floor');
          if (currCenterX + 1 < width) {
            tiles[y][currCenterX + 1] = createTile(currCenterX + 1, y, 'floor');
          }
        }
      }
    } else {
      // Vertical then horizontal
      for (let y = Math.min(prevCenterY, currCenterY); y <= Math.max(prevCenterY, currCenterY); y++) {
        if (y >= 0 && y < height && prevCenterX >= 0 && prevCenterX < width) {
          tiles[y][prevCenterX] = createTile(prevCenterX, y, 'floor');
          if (prevCenterX + 1 < width) {
            tiles[y][prevCenterX + 1] = createTile(prevCenterX + 1, y, 'floor');
          }
        }
      }
      for (let x = Math.min(prevCenterX, currCenterX); x <= Math.max(prevCenterX, currCenterX); x++) {
        if (currCenterY >= 0 && currCenterY < height && x >= 0 && x < width) {
          tiles[currCenterY][x] = createTile(x, currCenterY, 'floor');
          if (currCenterY + 1 < height) {
            tiles[currCenterY + 1][x] = createTile(x, currCenterY + 1, 'floor');
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
    'spawn'
  );
  
  // Generate enemies in rooms (not the first room)
  const enemies: Enemy[] = [];
  const enemyTypes: Enemy['type'][] = ['slime', 'skeleton', 'ghost'];
  
  for (let i = 1; i < rooms.length; i++) {
    const room = rooms[i];
    const numEnemies = 1 + Math.floor(Math.random() * (level + 1));
    
    for (let j = 0; j < numEnemies; j++) {
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
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
      });
    }
  }
  
  // Add a boss in the last room
  if (rooms.length > 2) {
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

function getEnemyHealth(type: Enemy['type'], level: number): number {
  const base = { slime: 30, skeleton: 50, ghost: 40, boss: 150 };
  return base[type] + level * 10;
}

function getEnemySpeed(type: Enemy['type']): number {
  const speeds = { slime: 1, skeleton: 2, ghost: 2.5, boss: 1.5 };
  return speeds[type];
}

function getEnemyDamage(type: Enemy['type'], level: number): number {
  const base = { slime: 5, skeleton: 10, ghost: 8, boss: 25 };
  return base[type] + level * 2;
}

function getEnemyAttackCooldown(type: Enemy['type']): number {
  const cooldowns = { slime: 2000, skeleton: 1500, ghost: 1000, boss: 1200 };
  return cooldowns[type];
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
