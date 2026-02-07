"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Sparkles } from "lucide-react"

export function VoiceControl() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [waveform, setWaveform] = useState<number[]>(Array(8).fill(0))

  useEffect(() => {
    if (!isListening) {
      setWaveform(Array(8).fill(0))
      return
    }
    const interval = setInterval(() => {
      setWaveform(Array(8).fill(0).map(() => Math.random() * 100))
    }, 100)
    return () => clearInterval(interval)
  }, [isListening])

  const handleToggle = () => {
    if (isListening) {
      setIsListening(false)
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setLastCommand("Attack -> Skeleton")
      }, 1500)
    } else {
      setIsListening(true)
      setLastCommand("")
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {/* Main mic button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-lg backdrop-blur-sm ${
          isListening
            ? "bg-red-600/80 border-red-500/60 shadow-red-900/40"
            : isProcessing
              ? "bg-orange-600/60 border-orange-500/40 shadow-orange-900/30"
              : "bg-[hsl(var(--card))]/80 border-[hsl(var(--border))] shadow-black/30 hover:border-[hsl(var(--foreground))]/30"
        }`}
      >
        {isListening ? (
          <Mic className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />
        ) : (
          <MicOff className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        )}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400/40"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Tambo badge */}
      <div className="flex items-center gap-0.5 bg-orange-900/30 border border-orange-700/30 rounded px-1.5 py-0.5">
        <Sparkles className="w-2 h-2 text-orange-400" />
        <span className="text-[7px] text-orange-400 font-medium">useTamboVoice</span>
      </div>

      {/* Waveform when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-end gap-[2px] h-4 bg-[hsl(var(--card))]/80 backdrop-blur-sm rounded px-1.5 py-1 border border-red-800/30"
          >
            {waveform.map((level, i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-red-400"
                animate={{ height: `${Math.max(15, level)}%` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status feedback */}
      <AnimatePresence mode="wait">
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-1 text-[9px] text-orange-400 bg-orange-900/20 rounded border border-orange-800/30 px-2 py-1 backdrop-blur-sm"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-2.5 h-2.5" />
            </motion.div>
            Processing...
          </motion.div>
        )}
        {lastCommand && !isProcessing && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[9px] text-emerald-400 bg-emerald-900/20 rounded border border-emerald-800/30 px-2 py-1 backdrop-blur-sm max-w-[140px] truncate"
          >
            {lastCommand}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
