import React from "react"
import type { Metadata } from 'next'
import { Press_Start_2P, Inter } from 'next/font/google'

import './globals.css'

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Deep Dungeon | AI-Native Roguelike Powered by Tambo',
  description:
    'A voice-controlled procedural roguelite RPG built for the WeMakeDevs Tambo Hackathon. Experience Tambo Generative UI, Voice AI Director, and dynamic difficulty that adapts to your playstyle.',
  keywords: [
    'Tambo',
    'Generative UI',
    'Voice AI',
    'Hackathon',
    'WeMakeDevs',
    'RPG',
    'Roguelite',
    'AI Director',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  )
}
