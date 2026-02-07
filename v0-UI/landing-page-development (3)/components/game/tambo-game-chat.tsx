"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Sparkles,
  X,
  Bot,
  User,
  Loader2,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  isGenerativeUI?: boolean
  componentName?: string
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Welcome, brave adventurer! I am your AI dungeon companion powered by Tambo. Ask me anything about the dungeon, request strategic advice, or command me to modify the world around you.",
    timestamp: Date.now() - 60000,
  },
  {
    id: "m2",
    role: "user",
    content: "What enemies are nearby?",
    timestamp: Date.now() - 45000,
  },
  {
    id: "m3",
    role: "assistant",
    content:
      "I detect 2 enemies within range: a Skeleton (30/40 HP) to the east, and a Dark Mage (55/60 HP) to the southeast. There is also a Dungeon Lord boss (120/150 HP) guarding the stairs. I recommend dealing with the Skeleton first.",
    timestamp: Date.now() - 30000,
    isGenerativeUI: true,
    componentName: "EnemyRadar",
  },
]

export function TamboGameChat({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content:
          "I have analyzed the dungeon layout using Tambo's context engine. The optimal path to the stairs avoids the trap corridor and approaches from the north. I can generate a PathfinderMap component for you!",
        timestamp: Date.now(),
        isGenerativeUI: true,
        componentName: "PathfinderMap",
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 bottom-4 w-[320px] z-50 flex flex-col bg-[hsl(var(--card))]/95 backdrop-blur-md border border-[hsl(var(--border))] rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(220,15%,8%)] shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-orange-900/40 border border-orange-700/40 rounded px-1.5 py-0.5">
                <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                <span className="font-pixel text-[8px] text-orange-300">TAMBO</span>
              </div>
              <span className="text-[11px] font-medium text-[hsl(var(--foreground))]">
                AI Guide
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 min-h-0"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-emerald-900/40 border border-emerald-700/40"
                      : "bg-orange-900/40 border border-orange-700/40"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Bot className="w-3 h-3 text-orange-400" />
                  )}
                </div>
                <div
                  className={`max-w-[82%] rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-900/20 border border-emerald-800/30 text-emerald-100"
                      : "bg-[hsl(220,15%,10%)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                  }`}
                >
                  {msg.isGenerativeUI && (
                    <div className="flex items-center gap-1 mb-1.5 pb-1.5 border-b border-orange-800/20">
                      <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                      <span className="text-[9px] text-orange-400 font-mono">
                        {"<"}TamboComponent: {msg.componentName}
                        {" />"}
                      </span>
                    </div>
                  )}
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-orange-900/40 border border-orange-700/40">
                  <Bot className="w-3 h-3 text-orange-400" />
                </div>
                <div className="flex items-center gap-1.5 bg-[hsl(220,15%,10%)] border border-[hsl(var(--border))] rounded-lg px-3 py-2">
                  <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    Tambo is thinking...
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(220,15%,7%)] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Tambo AI..."
                className="flex-1 bg-[hsl(220,15%,10%)] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-[11px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-[hsl(var(--primary))]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-30 transition-opacity hover:opacity-90 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
