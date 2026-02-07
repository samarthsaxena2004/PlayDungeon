"use client"

import { motion } from "framer-motion"
import { Skull, RotateCcw, Home, Trophy, Swords, Clock, Sparkles } from "lucide-react"

interface GameOverProps {
  score: number
  floor: number
  enemiesKilled: number
  timePlayed: string
  onRestart: () => void
  onHome: () => void
}

export function GameOverScreen({
  score = 2450,
  floor = 3,
  enemiesKilled = 14,
  timePlayed = "12:34",
  onRestart,
  onHome,
}: GameOverProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="w-full max-w-sm mx-4"
      >
        {/* Skull icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-4"
        >
          <div className="w-16 h-16 rounded-full bg-red-900/40 border-2 border-red-600/50 flex items-center justify-center shadow-lg shadow-red-900/30">
            <Skull className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-pixel text-xl text-red-400 text-center mb-1"
        >
          YOU DIED
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-[hsl(var(--muted-foreground))] mb-6"
        >
          The dungeon claims another soul...
        </motion.p>

        {/* Stats card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-[hsl(220,15%,8%)] border border-[hsl(var(--border))] rounded-lg p-4 mb-4"
        >
          <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[hsl(var(--border))]">
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span className="font-pixel text-[9px] text-orange-300">TAMBO AI ANALYSIS</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))]">SCORE</p>
                <p className="font-pixel text-sm text-amber-300">{score.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))]">KILLS</p>
                <p className="font-pixel text-sm text-red-300">{enemiesKilled}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-base">{">"}</span>
              </motion.div>
              <div>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))]">FLOOR</p>
                <p className="font-pixel text-sm text-blue-300">{floor}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))]">TIME</p>
                <p className="font-pixel text-sm text-purple-300">{timePlayed}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-3"
        >
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-pixel text-[10px] hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(var(--primary))/20]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RETRY
          </button>
          <button
            type="button"
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[hsl(220,15%,12%)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-pixel text-[10px] hover:border-[hsl(var(--muted-foreground))] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            HOME
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
