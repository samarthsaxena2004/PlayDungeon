"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Scroll, ChevronDown, ChevronUp, CheckCircle2, Circle, Sparkles } from "lucide-react"

interface Quest {
  id: string
  title: string
  description: string
  objectives: Array<{ text: string; completed: boolean; current: number; target: number }>
  reward: string
  isActive: boolean
  isTamboGenerated?: boolean
}

const DEMO_QUESTS: Quest[] = [
  {
    id: "q1",
    title: "Descent Into Darkness",
    description: "Reach floor 5 of the dungeon",
    objectives: [
      { text: "Reach Floor 5", completed: false, current: 3, target: 5 },
      { text: "Defeat 10 enemies", completed: true, current: 10, target: 10 },
    ],
    reward: "Epic Sword of Flames",
    isActive: true,
    isTamboGenerated: true,
  },
  {
    id: "q2",
    title: "The Lost Merchant",
    description: "Find and speak to the merchant on this floor",
    objectives: [
      { text: "Find the Merchant", completed: false, current: 0, target: 1 },
    ],
    reward: "50 Gold + Rare Potion",
    isActive: true,
    isTamboGenerated: true,
  },
  {
    id: "q3",
    title: "Treasure Hunter",
    description: "Open 3 chests on this floor",
    objectives: [
      { text: "Open chests", completed: false, current: 1, target: 3 },
    ],
    reward: "Mystery Item",
    isActive: false,
    isTamboGenerated: false,
  },
]

export function QuestPanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [quests] = useState<Quest[]>(DEMO_QUESTS)

  const activeQuests = quests.filter((q) => q.isActive)

  return (
    <div className="w-full bg-[hsl(var(--card))]/80 backdrop-blur-sm rounded-lg border border-[hsl(var(--border))] p-2.5">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <div className="flex items-center gap-1.5">
          <Scroll className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-pixel text-[10px] text-amber-300">QUESTS</span>
          <span className="font-pixel text-[8px] text-[hsl(var(--muted-foreground))]">
            ({activeQuests.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors" />
        ) : (
          <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex flex-col gap-2"
          >
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`rounded border p-2.5 transition-colors ${
                  quest.isActive
                    ? "bg-[hsl(220,15%,10%)] border-amber-800/40"
                    : "bg-[hsl(220,15%,8%)] border-[hsl(var(--border))] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-pixel text-[9px] text-[hsl(var(--foreground))] leading-tight">
                    {quest.title}
                  </span>
                  {quest.isTamboGenerated && (
                    <div className="flex items-center gap-0.5 shrink-0 bg-orange-900/30 border border-orange-700/30 rounded px-1 py-0.5">
                      <Sparkles className="w-2 h-2 text-orange-400" />
                      <span className="text-[7px] text-orange-400 font-medium">TAMBO</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2 leading-relaxed">
                  {quest.description}
                </p>
                <div className="flex flex-col gap-1.5">
                  {quest.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {obj.completed ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3 h-3 text-[hsl(var(--muted-foreground))] shrink-0" />
                      )}
                      <span
                        className={`text-[9px] ${
                          obj.completed
                            ? "text-emerald-400 line-through"
                            : "text-[hsl(var(--foreground))]"
                        }`}
                      >
                        {obj.text}
                      </span>
                      {!obj.completed && (
                        <span className="text-[8px] text-[hsl(var(--muted-foreground))] ml-auto">
                          {obj.current}/{obj.target}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-1.5 border-t border-[hsl(var(--border))]">
                  <span className="text-[8px] text-amber-400">{quest.reward}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
