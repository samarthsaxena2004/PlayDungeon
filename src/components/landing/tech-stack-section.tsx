"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Sparkles } from "lucide-react"

const TECH_ITEMS = [
  { name: "Tambo AI SDK", role: "AI Brain & Generative UI", highlight: true },
  { name: "Next.js 16", role: "Full-Stack Framework", highlight: false },
  { name: "React 19", role: "UI Runtime", highlight: false },
  { name: "Framer Motion", role: "Animations", highlight: false },
  { name: "Zustand", role: "Game State", highlight: false },
  { name: "Tailwind CSS", role: "Styling", highlight: false },
  { name: "Zod", role: "Schema Validation", highlight: false },
  { name: "Web Speech API", role: "Voice Recognition", highlight: false },
]

export function TechStackSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 md:py-32 px-4">
      <div className="max-w-4xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 text-xs font-mono text-muted-foreground border border-border rounded-full mb-5 tracking-widest">
            TECH STACK
          </span>
          <h2
            className="text-2xl md:text-4xl font-bold mb-4 text-balance"
            style={{ fontFamily: "var(--font-pixel), monospace", color: "hsl(0 0% 90%)" }}
          >
            BUILT WITH
          </h2>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {TECH_ITEMS.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="relative flex flex-col items-center px-5 py-3.5 rounded-xl border backdrop-blur-sm transition-all duration-300"
              style={{
                borderColor: tech.highlight ? "hsl(12 80% 45% / 0.35)" : "hsl(220 10% 18%)",
                background: tech.highlight
                  ? "linear-gradient(135deg, hsl(12 80% 45% / 0.08) 0%, transparent 100%)"
                  : "hsl(0 0% 6%)",
                boxShadow: tech.highlight ? "0 0 30px hsl(12 80% 45% / 0.1)" : "none",
              }}
            >
              {/* Tambo glow line on highlighted item */}
              {tech.highlight && (
                <>
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, hsl(12 80% 45%), transparent)" }}
                  />
                  <Sparkles className="w-3.5 h-3.5 text-primary mb-1" />
                </>
              )}
              <span
                className="text-sm font-semibold"
                style={{ color: tech.highlight ? "hsl(25 90% 60%)" : "hsl(0 0% 90%)" }}
              >
                {tech.name}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">{tech.role}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
