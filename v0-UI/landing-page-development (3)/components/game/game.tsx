"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameRenderer, type GameState } from "./game-renderer"
import { HealthBar } from "./health-bar"
import { Minimap } from "./minimap"
import { QuestPanel } from "./quest-panel"
import { NotificationBar } from "./notification-bar"
import { VoiceControl } from "./voice-control"
import { TamboGameChat } from "./tambo-game-chat"
import { ActionButtons } from "./action-buttons"
import { PreGameScreen } from "./pre-game-screen"
import { GameOverScreen } from "./game-over-screen"
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Zap,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"

type GamePhase = "loading" | "playing" | "gameover"

export function Game() {
  const [phase, setPhase] = useState<GamePhase>("loading")
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerName, setPlayerName] = useState("Adventurer")
  const [showTamboChat, setShowTamboChat] = useState(false)
  const [directorActive, setDirectorActive] = useState(false)
  const [showShop, setShowShop] = useState(false)

  const handleGameStateChange = useCallback((state: GameState) => {
    setGameState(state)
  }, [])

  // Simulate director pulses
  useEffect(() => {
    if (phase !== "playing") return
    const interval = setInterval(() => {
      setDirectorActive(true)
      setTimeout(() => setDirectorActive(false), 2000)
    }, 15000)
    return () => clearInterval(interval)
  }, [phase])

  if (phase === "loading") {
    return (
      <PreGameScreen
        onStart={(name) => {
          setPlayerName(name)
          setPhase("playing")
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden select-none bg-[#050508]">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(220,20%,6%)_0%,#050508_70%)]" />
      </div>

      {/* Back Button - floating top-left */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[hsl(var(--card))]/80 backdrop-blur-sm border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--foreground))]/30 transition-all shadow-xl shadow-black/30"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Main centered game container matching source: max-w-[1200px] max-h-[900px] 4:3 */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div
          className="relative w-full h-full max-w-[1200px] max-h-[900px] rounded-lg overflow-hidden shadow-2xl shadow-black/60"
          style={{ aspectRatio: "4/3" }}
        >
          {/* Border frame */}
          <div className="absolute inset-0 border-2 border-[hsl(var(--border))]/40 rounded-lg pointer-events-none z-30" />
          {/* Top gradient shine */}
          <div
            className="absolute inset-x-0 top-0 rounded-t-lg pointer-events-none z-30 bg-gradient-to-b from-[hsl(var(--foreground))]/[0.03] to-transparent"
            style={{ height: "25%" }}
          />

          {/* Game Canvas - fills the entire container */}
          <div className="absolute inset-0 bg-[#0a0a12]">
            <GameRenderer onGameStateChange={handleGameStateChange} />
          </div>

          {/* === HUD OVERLAYS (matching source positions) === */}

          {/* Health Bar - top left */}
          {gameState && (
            <div className="absolute top-4 left-4 z-20">
              <HealthBar
                stats={{
                  health: gameState.player.health,
                  maxHealth: gameState.player.maxHealth,
                  level: gameState.player.level,
                  xp: gameState.player.xp,
                  gold: gameState.player.gold,
                  shield: 20,
                  maxShield: 30,
                }}
              />
            </div>
          )}

          {/* Quest Panel - top left, below health */}
          <div className="absolute top-[165px] left-4 z-20 w-[200px]">
            <QuestPanel />
          </div>

          {/* Minimap - top right */}
          {gameState && (
            <div className="absolute top-4 right-4 z-20">
              <Minimap
                map={gameState.map}
                playerX={gameState.player.x}
                playerY={gameState.player.y}
                entities={gameState.entities}
                currentFloor={gameState.currentFloor}
              />
            </div>
          )}

          {/* Action Buttons - bottom right (matching source: big attack circle + interact) */}
          <div className="absolute bottom-4 right-4 z-20">
            <ActionButtons />
          </div>

          {/* Shop Button - bottom left */}
          <div className="absolute bottom-8 left-8 z-40">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShop(!showShop)}
              className="flex items-center gap-3 rounded-full px-5 py-3 border-2 border-yellow-500/40 shadow-lg bg-[hsl(var(--card))]/80 backdrop-blur-sm hover:bg-[hsl(var(--card))]/95 transition-all"
            >
              <div className="bg-yellow-500/20 p-1.5 rounded-full">
                <ShoppingBag className="text-yellow-400 w-4 h-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider leading-none">
                  The Shop
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-base font-mono font-bold text-[hsl(var(--foreground))] leading-none">
                    {gameState?.player.gold ?? 0}
                  </span>
                  <span className="text-[9px] text-yellow-500/60">GP</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Notification Bar - bottom center-left */}
          <div className="absolute bottom-4 left-4 z-10 w-[280px] pointer-events-none">
            <NotificationBar />
          </div>

          {/* AI Director Status Indicator - top center */}
          <AnimatePresence>
            {directorActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-sm text-red-400 px-3 py-1.5 rounded-full text-[10px] font-mono border border-red-500/30 flex items-center gap-2"
              >
                <Zap className="w-3 h-3 animate-pulse" />
                DIRECTOR ACTIVE
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile move hint */}
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 md:hidden pointer-events-none">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]/50 text-center">
              Use WASD or arrows to move
            </p>
          </div>

          {/* Damage overlay flash (low health) */}
          {gameState && gameState.player.health < 30 && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-25 rounded-lg"
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 40%, rgba(200,0,0,0.3) 100%)",
              }}
            />
          )}
        </div>
      </div>

      {/* === FLOATING PANELS OUTSIDE THE GAME FRAME === */}

      {/* Voice Control - fixed right side, above chat toggle */}
      <div className="fixed top-48 right-4 z-40 flex flex-col items-end gap-2">
        <VoiceControl />

        {/* Tambo Chat Toggle Button */}
        {!showTamboChat && (
          <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTamboChat(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-[hsl(var(--card))]/90 backdrop-blur-sm border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] relative transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
              <Sparkles className="w-1.5 h-1.5 text-[hsl(var(--primary-foreground))]" />
            </span>
          </motion.button>
        )}
      </div>

      {/* Tambo Chat Panel - floating right side */}
      <TamboGameChat
        isOpen={showTamboChat}
        onClose={() => setShowTamboChat(false)}
      />

      {/* Game Over overlay */}
      <AnimatePresence>
        {phase === "gameover" && (
          <GameOverScreen
            score={2450}
            floor={3}
            enemiesKilled={14}
            timePlayed="12:34"
            onRestart={() => setPhase("loading")}
            onHome={() => setPhase("loading")}
          />
        )}
      </AnimatePresence>

      {/* Keyboard shortcut listener */}
      <KeyboardShortcuts onGameOver={() => setPhase("gameover")} />
    </div>
  )
}

function KeyboardShortcuts({ onGameOver }: { onGameOver: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "g" && e.ctrlKey) {
        e.preventDefault()
        onGameOver()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onGameOver])

  return null
}
