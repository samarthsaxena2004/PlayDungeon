"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Swords, Sparkles, AlertTriangle, Package, MessageSquare } from "lucide-react"

interface Notification {
  id: string
  type: "combat" | "ai" | "warning" | "loot" | "story"
  message: string
  timestamp: number
}

const ICONS = {
  combat: Swords,
  ai: Sparkles,
  warning: AlertTriangle,
  loot: Package,
  story: MessageSquare,
}

const COLORS = {
  combat: "text-red-400 bg-red-900/20 border-red-800/30",
  ai: "text-orange-400 bg-orange-900/20 border-orange-800/30",
  warning: "text-yellow-400 bg-yellow-900/20 border-yellow-800/30",
  loot: "text-emerald-400 bg-emerald-900/20 border-emerald-800/30",
  story: "text-purple-400 bg-purple-900/20 border-purple-800/30",
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "combat", message: "Skeleton attacks for 12 damage!", timestamp: Date.now() - 8000 },
  { id: "n2", type: "ai", message: "Tambo AI Director: Difficulty adjusted to your playstyle", timestamp: Date.now() - 5000 },
  { id: "n3", type: "loot", message: "Found: Health Potion (+25 HP)", timestamp: Date.now() - 3000 },
  { id: "n4", type: "story", message: "A faint whisper echoes through the corridor...", timestamp: Date.now() - 1000 },
  { id: "n5", type: "warning", message: "Boss chamber detected nearby!", timestamp: Date.now() },
]

export function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Drip in notifications for demo
  useEffect(() => {
    if (currentIndex >= DEMO_NOTIFICATIONS.length) return
    const timer = setTimeout(() => {
      setNotifications((prev) => [...prev, DEMO_NOTIFICATIONS[currentIndex]])
      setCurrentIndex((prev) => prev + 1)
    }, 1500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Auto-remove old notifications
  useEffect(() => {
    if (notifications.length <= 5) return
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(1))
    }, 500)
    return () => clearTimeout(timer)
  }, [notifications])

  return (
    <div className="flex flex-col gap-1 max-h-[140px] overflow-hidden">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => {
          const Icon = ICONS[notif.type]
          const color = COLORS[notif.type]
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] backdrop-blur-sm ${color}`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="truncate">{notif.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
