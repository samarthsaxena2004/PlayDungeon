"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, MessageSquare, X, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/game/store";

type Props = {
    isChatOpen: boolean;
    onToggleChat: () => void;
    onExit: () => void;
};

export function SystemMenu({ isChatOpen, onToggleChat, onExit }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [sound, setSound] = useState(true);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col items-end gap-2">

            {/* ─── EXPANDED MENU ─── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="flex flex-col gap-2 mb-2"
                    >
                        {/* Toggle Chat */}
                        <button
                            onClick={() => { onToggleChat(); setIsOpen(false); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold border transition-colors shadow-lg
                    ${isChatOpen ? 'bg-purple-900 border-purple-500 text-white' : 'bg-black border-zinc-700 text-zinc-400'}
                `}
                        >
                            <MessageSquare size={14} />
                            {isChatOpen ? "HIDE CHAT" : "SHOW CHAT"}
                        </button>

                        {/* Sound Toggle (Stub) */}
                        <button
                            onClick={() => setSound(!sound)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-zinc-700 text-zinc-400 font-mono text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg"
                        >
                            {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            AUDIO
                        </button>

                        {/* Exit Game */}
                        <button
                            onClick={onExit}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-950 border border-red-800 text-red-500 font-mono text-xs font-bold hover:bg-red-900 transition-colors shadow-lg"
                        >
                            <LogOut size={14} />
                            EJECT CART
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── FAB TRIGGER ─── */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.9 }}
                className={`
            w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md
            transition-colors duration-300
            ${isOpen ? 'bg-white border-white text-black' : 'bg-black/50 border-zinc-700 text-white hover:border-white'}
        `}
            >
                {isOpen ? <X size={20} /> : <Settings size={20} />}
            </motion.button>
        </div>
    );
}
