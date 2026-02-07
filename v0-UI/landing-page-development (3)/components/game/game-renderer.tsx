"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// Tile types matching the source game
const TILE_SIZE = 32
const TILE_COLORS: Record<string, string> = {
  wall: "#1a1a2e",
  floor: "#2a2a3e",
  door: "#8b5e3c",
  chest: "#d4a017",
  trap: "#8b0000",
  stairs: "#4a9eff",
  water: "#1a4a6e",
  lava: "#ff4500",
  player: "#00ff88",
  enemy: "#ff3333",
  npc: "#ffaa00",
  boss: "#ff00ff",
  item: "#00ccff",
  exit: "#00ff00",
}

interface Entity {
  id: string
  type: string
  x: number
  y: number
  name: string
  health?: number
  maxHealth?: number
  emoji?: string
}

interface GameState {
  map: string[][]
  player: { x: number; y: number; health: number; maxHealth: number; level: number; xp: number; gold: number }
  entities: Entity[]
  currentFloor: number
  messages: string[]
}

// Demo game state for the design preview
function createDemoState(): GameState {
  const size = 20
  const map: string[][] = []
  for (let y = 0; y < size; y++) {
    const row: string[] = []
    for (let x = 0; x < size; x++) {
      if (y === 0 || y === size - 1 || x === 0 || x === size - 1) {
        row.push("wall")
      } else if ((x === 5 && y > 2 && y < 8) || (y === 10 && x > 3 && x < 12)) {
        row.push("wall")
      } else if (x === 8 && y === 10) {
        row.push("door")
      } else if (Math.random() < 0.02) {
        row.push("trap")
      } else {
        row.push("floor")
      }
    }
    map.push(row)
  }
  map[15][15] = "stairs"
  map[3][12] = "chest"
  map[7][3] = "chest"

  return {
    map,
    player: { x: 3, y: 3, health: 85, maxHealth: 100, level: 3, xp: 450, gold: 127 },
    entities: [
      { id: "e1", type: "enemy", x: 10, y: 5, name: "Skeleton", health: 30, maxHealth: 40, emoji: "skeleton" },
      { id: "e2", type: "enemy", x: 14, y: 12, name: "Dark Mage", health: 55, maxHealth: 60, emoji: "mage" },
      { id: "e3", type: "boss", x: 15, y: 14, name: "Dungeon Lord", health: 120, maxHealth: 150, emoji: "boss" },
      { id: "e4", type: "npc", x: 6, y: 14, name: "Merchant", emoji: "merchant" },
      { id: "e5", type: "item", x: 12, y: 3, name: "Health Potion", emoji: "potion" },
    ],
    currentFloor: 3,
    messages: [],
  }
}

export function GameRenderer({ onGameStateChange }: { onGameStateChange?: (state: GameState) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>(createDemoState)
  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const animFrameRef = useRef<number>(0)

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Dark background
    ctx.fillStyle = "#0a0a12"
    ctx.fillRect(0, 0, width, height)

    const offsetX = Math.floor(width / 2) - gameState.player.x * TILE_SIZE
    const offsetY = Math.floor(height / 2) - gameState.player.y * TILE_SIZE

    // FOV radius
    const fovRadius = 7

    // Draw map tiles
    for (let y = 0; y < gameState.map.length; y++) {
      for (let x = 0; x < gameState.map[0].length; x++) {
        const screenX = x * TILE_SIZE + offsetX
        const screenY = y * TILE_SIZE + offsetY

        if (screenX < -TILE_SIZE || screenX > width || screenY < -TILE_SIZE || screenY > height) continue

        const dist = Math.sqrt(
          Math.pow(x - gameState.player.x, 2) + Math.pow(y - gameState.player.y, 2)
        )

        if (dist > fovRadius + 2) continue

        const tile = gameState.map[y][x]
        const brightness = Math.max(0, 1 - dist / (fovRadius + 1))

        ctx.globalAlpha = brightness * 0.9 + 0.1
        ctx.fillStyle = TILE_COLORS[tile] || "#111"
        ctx.fillRect(screenX, screenY, TILE_SIZE - 1, TILE_SIZE - 1)

        // Wall top highlight
        if (tile === "wall") {
          ctx.fillStyle = `rgba(60, 60, 90, ${brightness * 0.3})`
          ctx.fillRect(screenX, screenY, TILE_SIZE - 1, 4)
        }

        // Chest glow
        if (tile === "chest") {
          ctx.shadowColor = "#d4a017"
          ctx.shadowBlur = 8 * brightness
          ctx.fillStyle = `rgba(212, 160, 23, ${brightness * 0.8})`
          ctx.fillRect(screenX + 6, screenY + 8, TILE_SIZE - 13, TILE_SIZE - 17)
          ctx.shadowBlur = 0
        }

        // Stairs
        if (tile === "stairs") {
          ctx.fillStyle = `rgba(74, 158, 255, ${brightness * 0.6})`
          for (let s = 0; s < 4; s++) {
            ctx.fillRect(screenX + 4, screenY + 4 + s * 6, TILE_SIZE - 8 - s * 4, 4)
          }
        }
      }
    }

    ctx.globalAlpha = 1

    // Draw entities
    for (const entity of gameState.entities) {
      const screenX = entity.x * TILE_SIZE + offsetX
      const screenY = entity.y * TILE_SIZE + offsetY
      const dist = Math.sqrt(
        Math.pow(entity.x - gameState.player.x, 2) + Math.pow(entity.y - gameState.player.y, 2)
      )
      if (dist > fovRadius) continue

      const brightness = Math.max(0.2, 1 - dist / fovRadius)
      ctx.globalAlpha = brightness

      const color = TILE_COLORS[entity.type] || "#fff"
      ctx.fillStyle = color

      // Entity body
      if (entity.type === "boss") {
        ctx.shadowColor = "#ff00ff"
        ctx.shadowBlur = 12
        ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 5, TILE_SIZE - 5)
        ctx.shadowBlur = 0
      } else if (entity.type === "enemy") {
        ctx.fillRect(screenX + 6, screenY + 4, TILE_SIZE - 13, TILE_SIZE - 9)
        // eyes
        ctx.fillStyle = "#fff"
        ctx.fillRect(screenX + 9, screenY + 8, 3, 3)
        ctx.fillRect(screenX + 18, screenY + 8, 3, 3)
      } else if (entity.type === "npc") {
        ctx.fillRect(screenX + 8, screenY + 4, TILE_SIZE - 17, TILE_SIZE - 9)
      } else if (entity.type === "item") {
        ctx.shadowColor = "#00ccff"
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Health bars for enemies
      if (entity.health !== undefined && entity.maxHealth) {
        const barWidth = TILE_SIZE - 4
        const healthPct = entity.health / entity.maxHealth
        ctx.fillStyle = "#333"
        ctx.fillRect(screenX + 2, screenY - 6, barWidth, 4)
        ctx.fillStyle = healthPct > 0.5 ? "#00ff88" : healthPct > 0.25 ? "#ffaa00" : "#ff3333"
        ctx.fillRect(screenX + 2, screenY - 6, barWidth * healthPct, 4)
      }
    }

    ctx.globalAlpha = 1

    // Draw player
    const playerScreenX = gameState.player.x * TILE_SIZE + offsetX
    const playerScreenY = gameState.player.y * TILE_SIZE + offsetY

    // Player glow
    ctx.shadowColor = "#00ff88"
    ctx.shadowBlur = 16
    ctx.fillStyle = "#00ff88"
    ctx.fillRect(playerScreenX + 6, playerScreenY + 2, TILE_SIZE - 13, TILE_SIZE - 5)
    ctx.shadowBlur = 0

    // Player eyes
    ctx.fillStyle = "#fff"
    ctx.fillRect(playerScreenX + 10, playerScreenY + 8, 3, 3)
    ctx.fillRect(playerScreenX + 18, playerScreenY + 8, 3, 3)

    // Vignette
    const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.7)
    gradient.addColorStop(0, "rgba(0,0,0,0)")
    gradient.addColorStop(1, "rgba(0,0,0,0.6)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }, [gameState])

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dx = 0, dy = 0
      switch (e.key) {
        case "ArrowUp": case "w": case "W": dy = -1; break
        case "ArrowDown": case "s": case "S": dy = 1; break
        case "ArrowLeft": case "a": case "A": dx = -1; break
        case "ArrowRight": case "d": case "D": dx = 1; break
        default: return
      }
      e.preventDefault()

      setGameState(prev => {
        const newX = prev.player.x + dx
        const newY = prev.player.y + dy
        if (
          newY >= 0 && newY < prev.map.length &&
          newX >= 0 && newX < prev.map[0].length &&
          prev.map[newY][newX] !== "wall"
        ) {
          return {
            ...prev,
            player: { ...prev.player, x: newX, y: newY },
          }
        }
        return prev
      })
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Render loop
  useEffect(() => {
    drawGame()
  }, [drawGame])

  // Notify parent of state changes
  useEffect(() => {
    onGameStateChange?.(gameState)
  }, [gameState, onGameStateChange])

  // Canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      drawGame()
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [drawGame])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ imageRendering: "pixelated" }}
      tabIndex={0}
    />
  )
}

export type { GameState, Entity }
