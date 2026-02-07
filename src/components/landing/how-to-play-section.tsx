"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Keyboard, Mic, Sparkles, Gamepad2 } from "lucide-react"

const CONTROLS = [
  {
    icon: Keyboard,
    title: "Keyboard",
    color: "hsl(220 60% 50%)",
    items: [
      { keys: ["W", "A", "S", "D"], action: "Move" },
      { keys: ["SPACE"], action: "Shoot fireball" },
      { keys: ["E"], action: "Interact" },
      { keys: ["V"], action: "Push-to-talk" },
    ],
  },
  {
    icon: Mic,
    title: "Voice via Tambo",
    color: "hsl(12 80% 45%)",
    isTambo: true,
    items: [
      { keys: ['"Move right 10"'], action: "Navigate" },
      { keys: ['"Shoot 5 times"'], action: "Attack" },
      { keys: ['"Intimidate"'], action: "Diplomacy" },
      { keys: ['"What should I do?"'], action: "Ask AI" },
    ],
  },
  {
    icon: Sparkles,
    title: "AI Chat via Tambo",
    color: "hsl(145 50% 40%)",
    isTambo: true,
    items: [
      { keys: ['"My stats"'], action: "Generative UI" },
      { keys: ['"Strategy"'], action: "Tactical advice" },
      { keys: ['"Quest progress"'], action: "Quest card" },
      { keys: ['"Controls"'], action: "Help card" },
    ],
  },
]

export function HowToPlaySection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 md:py-32 px-4" id="controls">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono rounded-full mb-5 tracking-widest"
            style={{
              background: "hsl(145 50% 40% / 0.1)",
              border: "1px solid hsl(145 50% 40% / 0.25)",
              color: "hsl(145 50% 50%)",
            }}
          >
            <Gamepad2 className="w-3 h-3" />
            HOW TO PLAY
          </span>
          <h2
            className="text-2xl md:text-4xl font-bold mb-4 text-balance"
            style={{ fontFamily: "var(--font-pixel), monospace", color: "hsl(0 0% 90%)" }}
          >
            THREE WAYS TO CONTROL
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm">
            Keyboard, voice, or AI chat. Two out of three are powered by{" "}
            <span className="text-primary font-medium">Tambo</span> for intelligent command processing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CONTROLS.map((control, i) => (
            <motion.div
              key={control.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
              className="relative p-5 rounded-xl border backdrop-blur-sm transition-all duration-300"
              style={{
                borderColor: control.isTambo ? `${control.color}30` : "hsl(220 10% 18%)",
                background: control.isTambo
                  ? `linear-gradient(135deg, ${control.color}06 0%, transparent 100%)`
                  : "hsl(0 0% 6%)",
                boxShadow: control.isTambo ? `0 0 25px ${control.color}08` : "none",
              }}
            >
              {/* Tambo glow line */}
              {control.isTambo && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent 0%, ${control.color} 50%, transparent 100%)` }}
                />
              )}

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${control.color}12`, border: `1px solid ${control.color}20` }}
                >
                  <control.icon className="w-5 h-5" style={{ color: control.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{control.title}</h3>
                  {control.isTambo && (
                    <span
                      className="text-[8px] font-mono tracking-wider"
                      style={{ color: control.color }}
                    >
                      TAMBO POWERED
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {control.items.map((item) => (
                  <div key={item.action} className="flex items-center justify-between gap-3">
                    <div className="flex gap-1 shrink-0">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="px-2 py-1 text-[9px] font-mono rounded border text-muted-foreground"
                          style={{
                            background: "hsl(0 0% 8%)",
                            borderColor: "hsl(220 10% 20%)",
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground/70">{item.action}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
