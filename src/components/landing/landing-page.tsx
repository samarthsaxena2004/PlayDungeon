"use client"

import { HeroSection } from "./hero-section"
import { TamboShowcase } from "./tambo-showcase"
import { ArchitectureSection } from "./architecture-section"
import { LeaderboardSection } from "./leaderboard-section"
import { HowToPlaySection } from "./how-to-play-section"
import { TechStackSection } from "./tech-stack-section"
import { FooterSection } from "./footer-section"

export function LandingPage() {
  return (
    <main className="relative overflow-x-hidden">
      {/* 1. Full-screen hero -- minimal friction to enter game */}
      <HeroSection />

      {/* Divider glow */}
      <div
        className="h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(12 80% 45% / 0.3), transparent)" }}
      />

      {/* 2. Tambo features -- the star of the show */}
      <TamboShowcase />

      {/* 3. Architecture -- how Tambo drives the game loop */}
      <ArchitectureSection />

      {/* Divider */}
      <div
        className="h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(220 10% 18%), transparent)" }}
      />

      {/* 4. How to play -- 2 of 3 methods are Tambo-powered */}
      <HowToPlaySection />

      {/* Divider */}
      <div
        className="h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(12 80% 45% / 0.2), transparent)" }}
      />

      {/* 5. Leaderboard -- Tambo Generative UI showcase */}
      <LeaderboardSection />

      {/* Divider */}
      <div
        className="h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(220 10% 18%), transparent)" }}
      />

      {/* 6. Tech Stack -- Tambo highlighted first */}
      <TechStackSection />

      {/* 7. Footer with final CTA */}
      <FooterSection />
    </main>
  )
}
