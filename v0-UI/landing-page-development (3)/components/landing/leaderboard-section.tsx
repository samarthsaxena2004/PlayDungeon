"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Trophy, Skull, Flame, Shield, Crown, Swords, Sparkles, ChevronUp, Timer } from "lucide-react"

const MOCK_PLAYERS = [
  { rank: 1, name: "DarkSlayer99", score: 14850, level: 12, kills: 127, time: "1h 23m", class: "Berserker" },
  { rank: 2, name: "ShadowMage", score: 12400, level: 10, kills: 98, time: "1h 05m", class: "Mage" },
  { rank: 3, name: "IronShield", score: 11200, level: 9, kills: 76, time: "58m", class: "Paladin" },
  { rank: 4, name: "GhostWhisper", score: 9800, level: 8, kills: 65, time: "47m", class: "Rogue" },
  { rank: 5, name: "FlameWarden", score: 8600, level: 7, kills: 52, time: "42m", class: "Mage" },
  { rank: 6, name: "VoidWalker", score: 7200, level: 6, kills: 43, time: "38m", class: "Rogue" },
  { rank: 7, name: "BoneCrusher", score: 6100, level: 5, kills: 38, time: "33m", class: "Berserker" },
  { rank: 8, name: "LightBringer", score: 5400, level: 5, kills: 31, time: "29m", class: "Paladin" },
]

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return {
        border: "hsl(40 80% 50% / 0.35)",
        bg: "linear-gradient(135deg, hsl(40 80% 50% / 0.06) 0%, transparent 100%)",
        glow: "0 0 25px hsl(40 80% 50% / 0.12)",
      }
    case 2:
      return {
        border: "hsl(220 10% 50% / 0.3)",
        bg: "linear-gradient(135deg, hsl(220 10% 50% / 0.04) 0%, transparent 100%)",
        glow: "0 0 15px hsl(220 10% 50% / 0.08)",
      }
    case 3:
      return {
        border: "hsl(25 60% 40% / 0.3)",
        bg: "linear-gradient(135deg, hsl(25 60% 40% / 0.04) 0%, transparent 100%)",
        glow: "0 0 15px hsl(25 60% 40% / 0.08)",
      }
    default:
      return {
        border: "hsl(220 10% 18%)",
        bg: "hsl(0 0% 6%)",
        glow: "none",
      }
  }
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5" style={{ color: "hsl(40 80% 50%)" }} />
  if (rank === 2) return <Shield className="w-5 h-5" style={{ color: "hsl(220 10% 60%)" }} />
  if (rank === 3) return <Swords className="w-5 h-5" style={{ color: "hsl(25 60% 40%)" }} />
  return <span className="text-xs font-mono text-muted-foreground/60">#{rank}</span>
}

function PlayerRow({
  player,
  index,
}: {
  player: (typeof MOCK_PLAYERS)[0]
  index: number
}) {
  const style = getRankStyle(player.rank)

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border p-3.5 md:p-4 transition-all duration-200 hover:scale-[1.01]"
      style={{
        borderColor: style.border,
        background: style.bg,
        boxShadow: style.glow,
      }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Rank */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted/30">
          <RankIcon rank={player.rank} />
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{player.name}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground shrink-0">
              {player.class}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Flame className="w-3 h-3 text-primary/70" />
              Lv.{player.level}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Skull className="w-3 h-3 text-destructive/60" />
              {player.kills}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Timer className="w-3 h-3 text-accent/60" />
              {player.time}
            </span>
          </div>
        </div>

        {/* Score - Visual weight on the right */}
        <div className="text-right shrink-0">
          <span className="text-base md:text-lg font-bold text-primary font-mono">
            {player.score.toLocaleString()}
          </span>
          <span className="block text-[8px] font-mono text-muted-foreground/50 tracking-wider">SCORE</span>
        </div>
      </div>
    </motion.div>
  )
}

function GenerativeLeaderboard() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (isAnimating) {
      setVisibleCount(0)
      let count = 0
      const interval = setInterval(() => {
        count++
        setVisibleCount(count)
        if (count >= 5) {
          clearInterval(interval)
          setIsAnimating(false)
        }
      }, 350)
      return () => clearInterval(interval)
    }
  }, [isAnimating])

  return (
    <div className="relative">
      {/* Tambo Generative UI header -- Von Restorff: unique treatment */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "hsl(12 80% 45% / 0.08)",
            border: "1px solid hsl(12 80% 45% / 0.2)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-mono text-primary/80 tracking-wider">{"<TamboLeaderboard />"}</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <span
          className="text-[9px] font-mono px-2 py-0.5 rounded"
          style={{ background: "hsl(12 80% 45% / 0.08)", color: "hsl(25 90% 60%)" }}
        >
          GENERATIVE UI
        </span>
      </div>

      {/* Entries */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {MOCK_PLAYERS.slice(0, visibleCount).map((player, i) => (
            <PlayerRow key={player.rank} player={player} index={i} />
          ))}
        </AnimatePresence>

        {/* Loading shimmer */}
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-4 rounded-xl border border-primary/10 bg-primary/[0.02]"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "hsl(12 80% 50%)",
                boxShadow: "0 0 8px hsl(12 80% 50% / 0.5)",
                animation: "pulse 1s ease-in-out infinite",
              }}
            />
            <span className="text-[10px] font-mono text-primary/50 animate-pulse">
              Tambo generating leaderboard entry...
            </span>
          </motion.div>
        )}
      </div>

      {/* Show more */}
      {!isAnimating && visibleCount < MOCK_PLAYERS.length && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setVisibleCount(MOCK_PLAYERS.length)}
          className="mt-4 w-full py-3 rounded-xl border border-border bg-card/20 text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all font-mono flex items-center justify-center gap-2"
          type="button"
        >
          <ChevronUp className="w-3.5 h-3.5 rotate-180" />
          Show all {MOCK_PLAYERS.length} players
        </motion.button>
      )}
    </div>
  )
}

export function LeaderboardSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 md:py-32 px-4" id="leaderboard">
      <div className="max-w-3xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono rounded-full mb-5 tracking-widest"
            style={{
              background: "hsl(40 80% 50% / 0.1)",
              border: "1px solid hsl(40 80% 50% / 0.25)",
              color: "hsl(40 80% 55%)",
            }}
          >
            <Trophy className="w-3 h-3" />
            HALL OF FAME
          </span>
          <h2
            className="text-2xl md:text-4xl font-bold mb-4 text-balance"
            style={{ fontFamily: "var(--font-pixel), monospace", color: "hsl(0 0% 90%)" }}
          >
            LEADERBOARD
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm">
            Top dungeon crawlers, rendered as a{" "}
            <span className="text-primary font-medium">Tambo Generative UI component</span> --
            each entry streamed and validated through TamboComponent Zod schemas.
          </p>
        </motion.div>

        {/* Leaderboard card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative"
        >
          {/* Outer glow */}
          <div
            className="absolute -inset-px rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(180deg, hsl(12 80% 45% / 0.15) 0%, transparent 30%, transparent 70%, hsl(12 80% 45% / 0.08) 100%)",
            }}
          />
          <div
            className="relative p-5 md:p-7 rounded-2xl border"
            style={{
              borderColor: "hsl(12 80% 45% / 0.15)",
              background: "linear-gradient(180deg, hsl(0 0% 5%) 0%, hsl(0 0% 4%) 100%)",
              boxShadow: "0 0 50px hsl(12 80% 45% / 0.06)",
            }}
          >
            <GenerativeLeaderboard />
          </div>
        </motion.div>

        {/* Integration note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider"
            style={{
              background: "hsl(12 80% 45% / 0.06)",
              border: "1px solid hsl(12 80% 45% / 0.15)",
              color: "hsl(25 90% 60% / 0.7)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            Rendered via TamboComponent with propsSchema validation
          </span>
        </motion.div>
      </div>
    </section>
  )
}
