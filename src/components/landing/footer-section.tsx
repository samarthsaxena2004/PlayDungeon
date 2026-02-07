"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="relative py-20 px-4 border-t border-border">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center top, hsl(12 80% 45% / 0.04) 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2
            className="text-xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-pixel), monospace", color: "hsl(0 0% 90%)" }}
          >
            READY TO DESCEND?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed text-sm">
            Face the darkness. Command your fate with your voice. Let{" "}
            <span className="text-primary font-medium">Tambo</span> be your Dungeon Master.
          </p>
          <Link href="/play">
            <button
              className="group relative px-9 py-4 text-sm font-bold tracking-widest rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                fontFamily: "var(--font-pixel), monospace",
                background: "linear-gradient(135deg, hsl(0 70% 38%) 0%, hsl(25 80% 42%) 100%)",
                border: "2px solid hsl(12 80% 50% / 0.5)",
                color: "hsl(0 0% 98%)",
                boxShadow: "0 0 30px hsl(12 80% 45% / 0.3), 0 4px 20px hsl(0 0% 0% / 0.5)",
              }}
              type="button"
            >
              <span className="relative z-10">ENTER THE DUNGEON</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.1) 50%, transparent 100%)",
                }}
              />
            </button>
          </Link>
        </motion.div>

        {/* Credits */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-mono">
            <Sparkles className="w-3 h-3 text-primary/50" />
            <span>Deep Dungeon -- Built with Tambo AI SDK</span>
          </div>

          <div className="flex items-center gap-5 text-[10px] text-muted-foreground/60 font-mono">
            <a
              href="https://www.tambo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              tambo.co
            </a>
            <a
              href="https://www.wemakedevs.org/hackathons/tambo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              WeMakeDevs Hackathon
            </a>
            <span>by Samarth Saxena</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
