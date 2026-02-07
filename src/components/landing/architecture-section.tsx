"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ArrowRight, Cpu, Gamepad2, Monitor, Zap, Sparkles } from "lucide-react"

const FLOW_STEPS = [
  {
    icon: Gamepad2,
    label: "Player Input",
    sublabel: "Voice / Keyboard / Chat",
    color: "hsl(145 50% 40%)",
  },
  {
    icon: Monitor,
    label: "Game State",
    sublabel: "HP, Position, Inventory",
    color: "hsl(40 80% 50%)",
  },
  {
    icon: Cpu,
    label: "Tambo AI Agent",
    sublabel: "Context + Tool Calls",
    color: "hsl(12 80% 45%)",
    isTambo: true,
  },
  {
    icon: Zap,
    label: "Game Dispatcher",
    sublabel: "spawn, modify, narrate",
    color: "hsl(220 60% 50%)",
  },
]

// Animated pipeline showing AI processing stages
function AIPipeline() {
  const stages = ["RECEIVING INPUT", "ANALYZING CONTEXT", "SELECTING TOOL", "GENERATING UI", "DISPATCHING"]
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [stages.length])

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5">
      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
      <div className="flex items-center gap-1.5 overflow-hidden">
        {stages.map((stage, i) => (
          <span
            key={stage}
            className="text-[9px] font-mono tracking-wider whitespace-nowrap transition-all duration-300"
            style={{
              color: i === currentStage ? "hsl(25 90% 60%)" : "hsl(220 5% 35%)",
              textShadow: i === currentStage ? "0 0 8px hsl(12 80% 45% / 0.5)" : "none",
            }}
          >
            {stage}
            {i < stages.length - 1 && (
              <span className="mx-1 text-muted-foreground/20">{">"}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ArchitectureSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(12 80% 45% / 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
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
            ARCHITECTURE
          </span>
          <h2
            className="text-2xl md:text-4xl font-bold mb-4 text-balance"
            style={{ fontFamily: "var(--font-pixel), monospace", color: "hsl(0 0% 90%)" }}
          >
            THE TAMBO GAME LOOP
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Unlike traditional games, Tambo is integrated directly into the game loop. Every player action flows
            through the AI agent before being dispatched.
          </p>
        </motion.div>

        {/* Architecture Flow - Horizontal steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 mb-8">
          {FLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              className="flex items-center gap-2 md:gap-3"
            >
              <div
                className="relative flex flex-col items-center p-5 md:p-6 rounded-xl border min-w-[160px] md:min-w-[180px] transition-all duration-300"
                style={{
                  borderColor: step.isTambo ? `${step.color}40` : `${step.color}25`,
                  background: step.isTambo
                    ? `linear-gradient(135deg, ${step.color}08 0%, transparent 100%)`
                    : "hsl(0 0% 6%)",
                  boxShadow: step.isTambo ? `0 0 30px ${step.color}15, 0 0 60px ${step.color}05` : `0 0 15px ${step.color}08`,
                }}
              >
                {/* Tambo highlight glow line */}
                {step.isTambo && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${step.color} 50%, transparent 100%)`,
                    }}
                  />
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${step.color}12`, border: `1px solid ${step.color}20` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-foreground text-center mb-1">
                  {step.label}
                </h3>
                <p className="text-[9px] md:text-[10px] font-mono text-muted-foreground text-center">{step.sublabel}</p>
                {step.isTambo && (
                  <span
                    className="mt-2 text-[8px] font-mono px-2 py-0.5 rounded"
                    style={{ background: `${step.color}12`, color: step.color }}
                  >
                    TAMBO SDK
                  </span>
                )}
              </div>

              {/* Arrow connector */}
              {i < FLOW_STEPS.length - 1 && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="hidden md:block"
                >
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Loop label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="hidden md:flex justify-center mb-10"
        >
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/30 font-mono">
            <div className="w-[300px] h-px bg-gradient-to-r from-transparent via-muted-foreground/15 to-transparent" />
            <span className="whitespace-nowrap tracking-widest">CONTINUOUS LOOP</span>
            <div className="w-[300px] h-px bg-gradient-to-r from-transparent via-muted-foreground/15 to-transparent" />
          </div>
        </motion.div>

        {/* AI Pipeline animation + Code snippet side by side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          {/* AI Pipeline */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground/50 tracking-wider">LIVE AI PIPELINE</h3>
            <AIPipeline />
            <div className="p-4 rounded-xl border border-border bg-card/40">
              <h4 className="text-xs font-mono text-muted-foreground/60 mb-3">Tambo Tool Registry</h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "triggerAttack",
                  "triggerInteract",
                  "getGameState",
                  "triggerAnalyze",
                  "spawn_entity",
                  "modify_room",
                  "grant_loot",
                  "combat_decision",
                  "create_quest",
                  "social_interaction",
                ].map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 text-[9px] font-mono rounded border border-primary/15 bg-primary/5 text-primary/70"
                  >
                    {tool}()
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Code snippet */}
          <div>
            <h3 className="text-xs font-mono text-muted-foreground/50 tracking-wider mb-4">PROVIDER CODE</h3>
            <div
              className="rounded-xl border overflow-hidden"
              style={{
                borderColor: "hsl(12 80% 45% / 0.2)",
                boxShadow: "0 0 25px hsl(12 80% 45% / 0.06)",
              }}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(40_80%_50%)]/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
                <span className="ml-2 text-[10px] font-mono text-muted-foreground/50">tambo-provider-wrapper.tsx</span>
              </div>
              <pre className="p-4 text-[10px] md:text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed bg-[hsl(0_0%_3%)]">
                <code>{`<TamboProvider
  apiKey={apiKey}
  tools={gameTools}
  components={tamboGameComponents}
  contextHelpers={context}
>
  <DungeonGame />    {/* Full AI awareness */}
</TamboProvider>`}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
