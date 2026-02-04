"use client";

import { useRef, useEffect } from "react";
import { useGameStore } from "@/game/store";
import VoiceInput from "@/components/VoiceInput";
import { motion, AnimatePresence } from "framer-motion";

export function ChatInterface({ onAction }: { onAction: (text: string) => void }) {
    const messages = useGameStore((s) => s.messages);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const addMessage = useGameStore((s) => s.addMessage);

    const handleCommand = (text: string) => {
        // We let the parent handle the API trigger
        onAction(text);
    };

    return (
        <div className="flex flex-col h-full bg-black/40 border-r border-[#333]">
            {/* ─── HEADER ───────────────────────────── */}
            <div className="p-4 border-b border-[#333] flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-wider text-white">
                    PLAY<span className="text-purple-400">DUNGEON</span>
                </h1>
                <div className="text-xs text-gray-500 uppercase">System: Online</div>
            </div>

            {/* ─── MESSAGES ─────────────────────────── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                  max-w-[85%] p-3 rounded-lg text-sm leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-purple-900/40 border border-purple-500/30 text-purple-100 rounded-br-none'
                                        : 'bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-bl-none'}
                `}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* ─── INPUT AREA ───────────────────────── */}
            <div className="p-4 border-t border-[#333] bg-black/60 backdrop-blur-md">
                <VoiceInput onCommand={handleCommand} />
            </div>
        </div>
    );
}
