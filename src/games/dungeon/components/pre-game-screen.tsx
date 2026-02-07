"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, Swords } from "lucide-react"

const LOADING_STAGES = [
    { label: "Initializing Tambo AI Engine...", icon: Sparkles },
    { label: "Generating dungeon layout...", icon: Sparkles },
    { label: "Spawning entities with AI director...", icon: Sparkles },
    { label: "Calibrating difficulty to your playstyle...", icon: Sparkles },
    { label: "Preparing voice recognition...", icon: Sparkles },
    { label: "Dungeon ready. Awaiting your command.", icon: Swords },
]

export function PreGameScreen({ onStart }: { onStart: (name: string) => void }) {
    const [currentStage, setCurrentStage] = useState(0)
    const [isReady, setIsReady] = useState(false)
    const [playerName, setPlayerName] = useState("")

    useEffect(() => {
        if (currentStage >= LOADING_STAGES.length - 1) {
            setIsReady(true)
            return
        }
        const timer = setTimeout(
            () => setCurrentStage((prev) => prev + 1),
            800 + Math.random() * 600
        )
        return () => clearTimeout(timer)
    }, [currentStage])

    return (
        <div className="fixed inset-0 bg-[#060610] flex flex-col items-center justify-center p-6 z-50">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(12,80%,45%,0.05)_0%,transparent_60%)]" />
                {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 rounded-full bg-orange-400/30"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                        animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            delay: Math.random() * 2,
                            repeat: Infinity,
                        }}
                    />
                ))}
            </div>

            {/* Logo */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative mb-8"
            >
                <h1 className="font-pixel text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-400 to-red-600 text-center">
                    DEEP DUNGEON
                </h1>
                <div className="absolute -inset-4 bg-gradient-to-b from-orange-500/10 to-transparent rounded-full blur-xl -z-10" />
            </motion.div>

            {/* Loading stages */}
            <div className="w-full max-w-md mb-8 flex flex-col gap-1.5">
                {LOADING_STAGES.slice(0, currentStage + 1).map((stage, i) => {
                    const Icon = stage.icon
                    const isActive = i === currentStage
                    const isDone = i < currentStage
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded transition-colors ${isActive
                                    ? "bg-orange-900/20 border border-orange-800/30"
                                    : isDone
                                        ? "opacity-50"
                                        : ""
                                }`}
                        >
                            {isActive && !isReady ? (
                                <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin shrink-0" />
                            ) : (
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isReady && isActive ? "text-emerald-400" : "text-orange-400"}`} />
                            )}
                            <span
                                className={`text-xs ${isActive
                                        ? isReady
                                            ? "text-emerald-300"
                                            : "text-orange-300"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                {stage.label}
                            </span>
                            {isDone && (
                                <span className="ml-auto text-[9px] text-emerald-400 font-pixel">DONE</span>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md mb-8">
                <div className="h-1.5 bg-[hsl(220,10%,12%)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full"
                        animate={{ width: `${((currentStage + 1) / LOADING_STAGES.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="font-pixel text-[8px] text-muted-foreground">
                        TAMBO AI
                    </span>
                    <span className="font-pixel text-[8px] text-muted-foreground">
                        {Math.round(((currentStage + 1) / LOADING_STAGES.length) * 100)}%
                    </span>
                </div>
            </div>

            {/* Hero Name + Start */}
            <AnimatePresence>
                {isReady && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="flex flex-col items-center gap-4 w-full max-w-sm"
                    >
                        <div className="w-full bg-[hsl(220,15%,8%)]/80 border border-border rounded-lg p-4 backdrop-blur-sm">
                            <label
                                htmlFor="playerName"
                                className="block text-[10px] font-pixel text-muted-foreground mb-2"
                            >
                                HERO NAME
                            </label>
                            <input
                                id="playerName"
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Adventurer"
                                className="w-full px-3 py-2 bg-[hsl(220,15%,6%)] border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") onStart(playerName.trim() || "Adventurer")
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => onStart(playerName.trim() || "Adventurer")}
                            className="relative px-10 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-primary-foreground font-pixel text-sm shadow-lg shadow-orange-900/40 hover:from-orange-500 hover:to-red-500 transition-all"
                        >
                            <motion.div
                                className="absolute inset-0 rounded-lg"
                                animate={{
                                    boxShadow: [
                                        "0 0 20px hsl(12 80% 45% / 0.3)",
                                        "0 0 40px hsl(12 80% 45% / 0.5)",
                                        "0 0 20px hsl(12 80% 45% / 0.3)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            START GAME
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
