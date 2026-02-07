"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import Link from "next/link"

const PARTICLES_COUNT = 35

const VOICE_COMMANDS = [
  '"Move right 10 blocks"',
  '"Cast fireball at skeleton"',
  '"Intimidate the goblin"',
  '"What should I do?"',
  '"Open the treasure chest"',
  '"Flee north through the passage"',
]

function FireParticle({ delay }: { delay: number }) {
  const randomX = Math.random() * 100
  const randomDuration = 3 + Math.random() * 4
  const randomSize = 2 + Math.random() * 4
  const hue = 12 + Math.random() * 30
  const lightness = 40 + Math.random() * 30

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${randomX}%`,
        bottom: "-10px",
        width: randomSize,
        height: randomSize,
        background: `hsl(${hue} 80% ${lightness}%)`,
      }}
      animate={{
        y: [0, -900],
        opacity: [0, 1, 0.8, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: randomDuration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeOut",
      }}
    />
  )
}

function TypingVoiceCommand() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const command = VOICE_COMMANDS[currentIndex]
    let timeout: NodeJS.Timeout

    if (!isDeleting) {
      if (displayed.length < command.length) {
        timeout = setTimeout(() => {
          setDisplayed(command.slice(0, displayed.length + 1))
        }, 50 + Math.random() * 40)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2200)
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, 25)
      } else {
        setIsDeleting(false)
        setCurrentIndex((prev) => (prev + 1) % VOICE_COMMANDS.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, currentIndex])

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 max-w-xs mx-auto">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
      <span className="text-xs font-mono text-primary/80 truncate">
        {displayed}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  )
}

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.5 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let current = 0
    const increment = target / 30
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 40)
    return () => clearInterval(interval)
  }, [started, target])

  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-bold text-primary font-pixel" style={{ fontFamily: "var(--font-pixel), monospace" }}>
        {count}+
      </span>
      <span className="text-[10px] font-mono text-muted-foreground tracking-wider mt-1">{label}</span>
    </div>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center bottom, hsl(12 40% 8%) 0%, hsl(0 0% 3%) 70%)" }}
    >
      {/* Dungeon grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient fire particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: PARTICLES_COUNT }).map((_, i) => (
            <FireParticle key={i} delay={i * 0.15} />
          ))}
        </div>
      )}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, hsl(0 0% 0% / 0.7) 100%)",
        }}
      />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0% / 0.3) 2px, hsl(0 0% 0% / 0.3) 4px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Tambo badge -- Von Restorff: unique glow that only Tambo elements get */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-mono tracking-widest"
            style={{
              background: "linear-gradient(135deg, hsl(12 80% 45% / 0.15) 0%, hsl(25 90% 50% / 0.08) 100%)",
              border: "1px solid hsl(12 80% 45% / 0.35)",
              boxShadow: "0 0 25px hsl(12 80% 45% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.05)",
              color: "hsl(25 90% 60%)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "hsl(12 80% 50%)",
                boxShadow: "0 0 8px hsl(12 80% 50% / 0.8)",
              }}
            />
            POWERED BY TAMBO AI
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none tracking-wider"
          style={{
            fontFamily: "var(--font-pixel), monospace",
            background: "linear-gradient(180deg, hsl(30 95% 60%) 0%, hsl(12 80% 45%) 50%, hsl(0 70% 35%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 40px hsl(12 80% 45% / 0.5))",
          }}
        >
          DEEP DUNGEON
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 text-muted-foreground text-sm md:text-base max-w-md leading-relaxed"
        >
          The first AI-native roguelike where{" "}
          <span className="text-primary font-semibold">Tambo is the Dungeon Master</span>.
          <br />
          Voice. Combat. Narrative. All AI.
        </motion.p>

        {/* Voice command typing animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6"
        >
          <TypingVoiceCommand />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8"
        >
          <Link href="/play">
            <button
              className="group relative px-10 py-5 text-base font-bold tracking-widest rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                fontFamily: "var(--font-pixel), monospace",
                background: "linear-gradient(135deg, hsl(0 70% 38%) 0%, hsl(25 80% 42%) 100%)",
                border: "2px solid hsl(12 80% 50% / 0.5)",
                color: "hsl(0 0% 98%)",
                boxShadow: "0 0 30px hsl(12 80% 45% / 0.3), 0 4px 20px hsl(0 0% 0% / 0.5)",
              }}
            >
              <span className="relative z-10">ENTER THE DUNGEON</span>
              {/* Shimmer effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.1) 50%, transparent 100%)",
                }}
              />
              {/* Pixel grid overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent 0px, transparent 4px, hsl(0 0% 100% / 0.15) 4px, hsl(0 0% 100% / 0.15) 8px)",
                }}
              />
            </button>
          </Link>
        </motion.div>

        {/* Tambo Stats Counter - Anchoring Effect */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-10 flex items-center gap-6 md:gap-10"
        >
          <AnimatedCounter target={12} label="TAMBO HOOKS" />
          <div className="w-px h-8 bg-border" />
          <AnimatedCounter target={7} label="GEN UI" />
          <div className="w-px h-8 bg-border" />
          <AnimatedCounter target={5} label="AI TOOLS" />
        </motion.div>

        {/* Built for badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="mt-6 text-[10px] text-muted-foreground/50 font-mono tracking-wider"
        >
          WeMakeDevs x Tambo Hackathon
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => {
          document.getElementById("tambo-features")?.scrollIntoView({ behavior: "smooth" })
        }}
        role="button"
        tabIndex={0}
        aria-label="Scroll to features"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            document.getElementById("tambo-features")?.scrollIntoView({ behavior: "smooth" })
          }
        }}
      >
        <span className="text-[10px] text-muted-foreground/40 font-mono tracking-widest">SCROLL TO EXPLORE</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  )
}
