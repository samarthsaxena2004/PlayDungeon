"use client"

import { useEffect, useRef } from "react"
import { Map } from "lucide-react"

interface MinimapProps {
  map: string[][]
  playerX: number
  playerY: number
  entities: Array<{ x: number; y: number; type: string }>
  currentFloor: number
}

const MINIMAP_TILE = 4

const MINIMAP_COLORS: Record<string, string> = {
  wall: "#1a1a2e",
  floor: "#2a2a3e",
  door: "#8b5e3c",
  chest: "#d4a017",
  trap: "#660000",
  stairs: "#4a9eff",
  water: "#1a4a6e",
  lava: "#cc3300",
}

export function Minimap({ map, playerX, playerY, entities, currentFloor }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !map.length) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const viewRadius = 15
    const size = viewRadius * 2 * MINIMAP_TILE
    canvas.width = size
    canvas.height = size

    ctx.fillStyle = "#06060e"
    ctx.fillRect(0, 0, size, size)

    for (let dy = -viewRadius; dy < viewRadius; dy++) {
      for (let dx = -viewRadius; dx < viewRadius; dx++) {
        const mapX = playerX + dx
        const mapY = playerY + dy

        if (mapY < 0 || mapY >= map.length || mapX < 0 || mapX >= map[0].length) continue

        const screenX = (dx + viewRadius) * MINIMAP_TILE
        const screenY = (dy + viewRadius) * MINIMAP_TILE
        const tile = map[mapY][mapX]

        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > viewRadius) continue

        const alpha = Math.max(0.15, 1 - dist / viewRadius)
        ctx.globalAlpha = alpha
        ctx.fillStyle = MINIMAP_COLORS[tile] || "#111"
        ctx.fillRect(screenX, screenY, MINIMAP_TILE, MINIMAP_TILE)
      }
    }

    ctx.globalAlpha = 1

    // Draw entities on minimap
    for (const entity of entities) {
      const dx = entity.x - playerX
      const dy = entity.y - playerY
      if (Math.abs(dx) > viewRadius || Math.abs(dy) > viewRadius) continue

      const screenX = (dx + viewRadius) * MINIMAP_TILE
      const screenY = (dy + viewRadius) * MINIMAP_TILE

      ctx.fillStyle =
        entity.type === "boss"
          ? "#ff00ff"
          : entity.type === "enemy"
            ? "#ff3333"
            : entity.type === "npc"
              ? "#ffaa00"
              : "#00ccff"
      ctx.fillRect(screenX, screenY, MINIMAP_TILE, MINIMAP_TILE)
    }

    // Player dot (center)
    const centerX = viewRadius * MINIMAP_TILE
    const centerY = viewRadius * MINIMAP_TILE
    ctx.fillStyle = "#00ff88"
    ctx.shadowColor = "#00ff88"
    ctx.shadowBlur = 6
    ctx.fillRect(centerX - 1, centerY - 1, MINIMAP_TILE + 2, MINIMAP_TILE + 2)
    ctx.shadowBlur = 0
  }, [map, playerX, playerY, entities])

  return (
    <div className="relative bg-[hsl(var(--card))]/80 backdrop-blur-sm rounded-lg border border-[hsl(var(--border))] p-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Map className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
        <span className="font-pixel text-[9px] text-[hsl(var(--muted-foreground))]">
          FLOOR {currentFloor}
        </span>
      </div>
      <div className="border border-[hsl(var(--border))] rounded bg-[#06060e] overflow-hidden">
        <canvas ref={canvasRef} className="w-[120px] h-[120px]" style={{ imageRendering: "pixelated" }} />
      </div>
    </div>
  )
}
