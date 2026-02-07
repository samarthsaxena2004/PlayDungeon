"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import {
  Mic,
  Brain,
  Map,
  Swords,
  MessageCircle,
  Sparkles,
  Shield,
  Heart,
  Target,
  Flame,
  Eye,
  Wand2,
  ChevronRight,
} from "lucide-react"

// Von Restorff: Top 3 features get "hero" treatment. The rest are supporting grid.
// Serial Position: Strongest features first (Voice, Generative UI, AI Director) and last (TamboProvider)

const HERO_FEATURES = [
  {
    icon: Mic,
    title: "Voice-Driven Gameplay",
    hook: "useTamboVoice",
    description:
      'Speak naturally to control your character. "Move right 10 blocks", "Intimidate the skeleton" -- Tambo processes natural language voice commands and routes them to game actions in real-time.',
    codePreview: `const { transcript, isListening } = useTamboVoice({
  onCommand: (cmd) => gameEngine.execute(cmd),
  contextHelpers: [getGameState],
})`,
    color: "hsl(12 80% 45%)",
    glowColor: "hsl(12 80% 45% / 0.12)",
  },
  {
    icon: Sparkles,
    title: "7 Generative UI Components",
    hook: "TamboComponent",
    description:
      "PlayerStats, EnemyInfo, StrategyAdvice, QuestProgress, ControlsHelp, GameAction, DangerAlert -- all registered as TamboComponents with Zod schemas. The AI picks which UI to render based on context.",
    codePreview: `const components = [
  { name: "PlayerStats", propsSchema: z.object({...}) },
  { name: "StrategyAdvice", propsSchema: z.object({...}) },
  // ... 5 more Generative UI components
]`,
    color: "hsl(145 50% 40%)",
    glowColor: "hsl(145 50% 40% / 0.12)",
  },
  {
    icon: Brain,
    title: "AI Director System",
    hook: "generateWithTambo",
    description:
      "Tambo observes HP, kill rate, time alive, and playstyle to dynamically spawn enemies, modify rooms, grant loot, and shift difficulty -- maintaining your flow state through AI game direction.",
    codePreview: `await generateWithTambo(tamboClient, {
  tools: [spawn_entity, modify_room, grant_loot],
  context: { health, killRate, timeAlive },
  model: "tambo-director-v1",
})`,
    color: "hsl(220 60% 50%)",
    glowColor: "hsl(220 60% 50% / 0.12)",
  },
]

const GRID_FEATURES = [
  {
    icon: MessageCircle,
    title: "AI Chat Assistant",
    hook: "useTamboThread",
    description:
      "Full in-game AI guide with streaming responses. Ask about stats, get strategy advice, or request combat tips.",
    color: "hsl(280 50% 50%)",
  },
  {
    icon: Map,
    title: "Procedural Maps",
    hook: "modify_room",
    description:
      "Cellular automata + Tambo. The AI modifies rooms with darkness, fog, fire, healing_aura based on behavior.",
    color: "hsl(40 80% 50%)",
  },
  {
    icon: Swords,
    title: "Intelligent Enemies",
    hook: "combat_decision",
    description:
      "Tambo decides enemy tactics in real-time. Aggressive, defensive, flank, flee, or cast_spell.",
    color: "hsl(0 70% 50%)",
  },
  {
    icon: Wand2,
    title: "Dynamic Content",
    hook: "spawn_custom_entity",
    description:
      "Tambo invents new enemies on the fly with custom stats, names, and descriptions from narrative context.",
    color: "hsl(320 50% 50%)",
  },
  {
    icon: Target,
    title: "Quest System",
    hook: "create_quest",
    description:
      "Tambo generates quests dynamically based on player actions. Title, description, targets, gold rewards.",
    color: "hsl(170 50% 40%)",
  },
  {
    icon: Heart,
    title: "Personality Engine",
    hook: "PlayerProfile",
    description:
      "Tracks cruelty, aggression, diplomacy. Tambo adapts narrative -- act violent and enemies become terrified.",
    color: "hsl(350 60% 50%)",
  },
  {
    icon: Shield,
    title: "Social Diplomacy",
    hook: "social_interaction",
    description:
      "Persuade, intimidate, trade -- Tambo processes social intents. End a battle without swinging a sword.",
    color: "hsl(190 60% 45%)",
  },
  {
    icon: Flame,
    title: "Story Engine",
    hook: "tambo-story-v1",
    description:
      "Every room, battle, discovery gets unique narration. Personality-aware atmospheric storytelling.",
    color: "hsl(25 80% 50%)",
  },
  {
    icon: Eye,
    title: "Full SDK Integration",
    hook: "TamboProvider",
    description:
      "TamboProvider wraps the game with tools, components, and contextHelpers -- full AI game loop awareness.",
    color: "hsl(260 50% 50%)",
  },
]

function HeroFeatureCard({
  feature,
  index,
}: {
  feature: (typeof HERO_FEATURES)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [isCodeVisible, setIsCodeVisible] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(0 0% 7%) 0%, hsl(0 0% 5%) 100%)`,
        border: `1px solid ${feature.color}30`,
        boxShadow: `0 0 40px ${feature.glowColor}, 0 0 80px ${feature.glowColor}`,
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${feature.color} 50%, transparent 100%)` }}
      />

      <div className="p-6 md:p-8">
        {/* Header row: F-pattern -- Tambo hook name on top-left where eyes land first */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${feature.color}12`,
                border: `1px solid ${feature.color}25`,
                boxShadow: `0 0 15px ${feature.color}10`,
              }}
            >
              <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
            </div>
            <div>
              {/* Hook name anchors the card -- Primacy Effect */}
              <span
                className="inline-block px-2.5 py-0.5 text-[10px] font-mono rounded-md tracking-wider font-semibold"
                style={{ background: `${feature.color}15`, color: feature.color }}
              >
                {feature.hook}
              </span>
              <h3 className="text-base md:text-lg font-semibold text-foreground mt-1.5">
                {feature.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{feature.description}</p>

        {/* Code preview toggle */}
        <button
          onClick={() => setIsCodeVisible(!isCodeVisible)}
          className="flex items-center gap-1.5 text-xs font-mono transition-colors"
          style={{ color: `${feature.color}` }}
          type="button"
        >
          <ChevronRight
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: isCodeVisible ? "rotate(90deg)" : "rotate(0deg)" }}
          />
          {isCodeVisible ? "Hide" : "View"} Tambo code
        </button>

        {/* Code preview */}
        <motion.div
          initial={false}
          animate={{ height: isCodeVisible ? "auto" : 0, opacity: isCodeVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div
            className="mt-4 rounded-lg border overflow-hidden"
            style={{
              borderColor: `${feature.color}20`,
              background: "hsl(0 0% 4%)",
            }}
          >
            <div
              className="flex items-center gap-1.5 px-3 py-2 border-b"
              style={{ borderColor: `${feature.color}15`, background: `${feature.color}05` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: `${feature.color}60` }} />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
              <span className="ml-auto text-[9px] font-mono text-muted-foreground/50">tambo integration</span>
            </div>
            <pre className="p-3 text-[11px] md:text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto">
              <code>{feature.codePreview}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function GridFeatureCard({
  feature,
  index,
}: {
  feature: (typeof GRID_FEATURES)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group relative p-5 rounded-xl border border-border bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/20"
      whileHover={{
        boxShadow: `0 0 25px ${feature.color}12`,
        y: -3,
      }}
    >
      {/* F-pattern: Hook name top-left, where eyes land first */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${feature.color}10`, border: `1px solid ${feature.color}20` }}
        >
          <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
        </div>
        <span
          className="text-[10px] font-mono rounded-md px-2 py-0.5 tracking-wider"
          style={{ background: `${feature.color}12`, color: feature.color }}
        >
          {feature.hook}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-1.5">{feature.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export function TamboShowcase() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <section id="tambo-features" className="relative py-24 md:py-32 px-4">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(12 80% 45%) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono rounded-full mb-5 tracking-widest"
            style={{
              background: "hsl(12 80% 45% / 0.1)",
              border: "1px solid hsl(12 80% 45% / 0.25)",
              color: "hsl(25 90% 60%)",
              boxShadow: "0 0 20px hsl(12 80% 45% / 0.08)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(12 80% 50%)", boxShadow: "0 0 6px hsl(12 80% 50% / 0.6)" }}
            />
            12 TAMBO INTEGRATIONS
          </span>
          <h2
            className="text-2xl md:text-4xl lg:text-5xl font-bold mb-5 text-balance"
            style={{ fontFamily: "var(--font-pixel), monospace", color: "hsl(0 0% 90%)" }}
          >
            TAMBO POWERS EVERYTHING
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            Deep Dungeon is not a game with AI bolted on. Tambo is woven into the game loop itself --
            from <span className="text-primary">voice input</span> to{" "}
            <span className="text-primary">enemy behavior</span>, from{" "}
            <span className="text-primary">UI generation</span> to{" "}
            <span className="text-primary">narrative</span>.
          </p>
        </motion.div>

        {/* Hero Features - Large cards (Von Restorff: visually distinct from grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
          {HERO_FEATURES.map((feature, i) => (
            <HeroFeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* Supporting Grid Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GRID_FEATURES.map((feature, i) => (
            <GridFeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
