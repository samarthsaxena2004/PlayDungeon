"use client"

import { motion } from "framer-motion"
import { Heart, Shield, Zap, Star } from "lucide-react"

interface PlayerStats {
  health: number
  maxHealth: number
  level: number
  xp: number
  gold: number
  shield?: number
  maxShield?: number
}

export function HealthBar({ stats }: { stats: PlayerStats }) {
  const healthPct = (stats.health / stats.maxHealth) * 100
  const shieldPct = stats.shield && stats.maxShield ? (stats.shield / stats.maxShield) * 100 : 0
  const xpToNext = stats.level * 200
  const xpPct = (stats.xp / xpToNext) * 100

  const healthColor =
    healthPct > 60 ? "bg-emerald-500" : healthPct > 30 ? "bg-yellow-500" : "bg-red-500"
  const healthGlow =
    healthPct > 60
      ? "shadow-emerald-500/40"
      : healthPct > 30
        ? "shadow-yellow-500/40"
        : "shadow-red-500/40"

  return (
    <div className="flex flex-col gap-2 min-w-[200px] bg-[hsl(var(--card))]/80 backdrop-blur-sm rounded-lg border border-[hsl(var(--border))] p-3">
      {/* Level badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-amber-900/60 border border-amber-700/50 rounded px-2 py-0.5">
          <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
          <span className="font-pixel text-[10px] text-amber-300">LVL {stats.level}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[10px] text-amber-400">{stats.gold}</span>
          <span className="text-[10px] text-amber-600">GOLD</span>
        </div>
      </div>

      {/* Health bar */}
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Heart className="w-3 h-3 text-red-400" fill="currentColor" />
          <span className="font-pixel text-[9px] text-red-300">
            {stats.health}/{stats.maxHealth}
          </span>
        </div>
        <div className="h-3 bg-[hsl(220,10%,12%)] rounded-sm border border-[hsl(220,10%,18%)] overflow-hidden">
          <motion.div
            className={`h-full ${healthColor} shadow-md ${healthGlow} rounded-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${healthPct}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
          {healthPct <= 30 && (
            <motion.div
              className="absolute inset-0 rounded-sm border border-red-500/50"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Shield bar */}
      {stats.shield !== undefined && stats.maxShield && (
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="font-pixel text-[9px] text-blue-300">
              {stats.shield}/{stats.maxShield}
            </span>
          </div>
          <div className="h-2 bg-[hsl(220,10%,12%)] rounded-sm border border-[hsl(220,10%,18%)] overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 shadow-md shadow-blue-500/30 rounded-sm"
              animate={{ width: `${shieldPct}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
      )}

      {/* XP bar */}
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Zap className="w-3 h-3 text-purple-400" />
          <span className="font-pixel text-[9px] text-purple-300">
            {stats.xp}/{xpToNext} XP
          </span>
        </div>
        <div className="h-1.5 bg-[hsl(220,10%,12%)] rounded-sm border border-[hsl(220,10%,18%)] overflow-hidden">
          <motion.div
            className="h-full bg-purple-500 rounded-sm"
            animate={{ width: `${xpPct}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          />
        </div>
      </div>
    </div>
  )
}
