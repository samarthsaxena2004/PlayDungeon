"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Flame, Hand, Gamepad2 } from "lucide-react"

export function ActionButtons() {
  const [showHelp, setShowHelp] = useState(false)
  const [canAttack] = useState(true)
  const [canInteract] = useState(true)
  const [attackFlash, setAttackFlash] = useState(false)

  const handleAttack = () => {
    setAttackFlash(true)
    setTimeout(() => setAttackFlash(false), 300)
  }

  return (
    <div className="flex flex-col gap-3 items-end">
      {/* Controls help toggle */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHelp(!showHelp)}
        className="w-8 h-8 rounded-full bg-[hsl(var(--card))]/80 backdrop-blur-sm border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        aria-label="Toggle controls help"
      >
        <Gamepad2 className="w-4 h-4" />
      </motion.button>

      {/* Collapsible keyboard shortcuts */}
      <motion.div
        initial={false}
        animate={{
          opacity: showHelp ? 1 : 0,
          height: showHelp ? "auto" : 0,
          marginBottom: showHelp ? 0 : -8,
        }}
        className="bg-[hsl(var(--card))]/90 backdrop-blur-sm border border-[hsl(var(--border))] rounded-lg overflow-hidden"
      >
        <div className="px-3 py-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Move</span>
            <kbd className="px-1.5 py-0.5 bg-[hsl(var(--muted))] rounded text-[9px] font-mono border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
              WASD
            </kbd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Attack</span>
            <kbd className="px-1.5 py-0.5 bg-[hsl(var(--muted))] rounded text-[9px] font-mono border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
              SPACE
            </kbd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Interact</span>
            <kbd className="px-1.5 py-0.5 bg-[hsl(var(--muted))] rounded text-[9px] font-mono border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
              E
            </kbd>
          </div>
        </div>
      </motion.div>

      {/* Interact Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => {}}
        className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 border-[3px] transition-all duration-200 ${
          canInteract
            ? "bg-[hsl(var(--accent))]/90 border-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-lg"
            : "bg-[hsl(var(--muted))]/50 border-[hsl(var(--muted-foreground))]/30 text-[hsl(var(--muted-foreground))] cursor-not-allowed"
        }`}
        style={canInteract ? { boxShadow: "0 8px 24px hsl(145 50% 40% / 0.25)" } : {}}
        aria-label="Interact (E)"
      >
        <Hand className="w-5 h-5" />
        <span className="text-[8px] font-bold tracking-wide">E</span>
      </motion.button>

      {/* Attack Button - big, prominent */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleAttack}
        className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 border-4 transition-all duration-200 ${
          canAttack
            ? "bg-[hsl(var(--destructive))]/90 border-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] shadow-xl"
            : "bg-[hsl(var(--muted))]/50 border-[hsl(var(--muted-foreground))]/30 text-[hsl(var(--muted-foreground))] cursor-not-allowed"
        }`}
        style={canAttack ? { boxShadow: "0 12px 32px hsl(0 75% 50% / 0.35)" } : {}}
        aria-label="Attack (Space)"
      >
        <Flame className="w-8 h-8" />
        <span className="text-[9px] font-bold tracking-wider opacity-80">SPACE</span>

        {/* Flash on attack */}
        {attackFlash && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-full border-4 border-[hsl(var(--destructive))]"
          />
        )}
      </motion.button>
    </div>
  )
}
