"use client";

import { useGameStore } from "@/game/store";
import { tamboComponentMap } from "@/tambo/registry";
import { motion } from "framer-motion";

export function GenerativeCanvas() {
    const { activeScene, meta, isThinking } = useGameStore();

    // Determine border color based on danger level
    const borderColor =
        meta.dangerLevel > 70 ? "border-red-500/50 shadow-red-900/20" :
            meta.mood === 'peaceful' ? "border-blue-500/30 shadow-blue-900/20" :
                "border-[#333]";

    return (
        <div className="relative h-full flex flex-col p-6 overflow-hidden bg-[#050505]">

            {/* ─── AMBIENT BACKGROUND LAYER ──────────────── */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            {/* ─── MAIN CANVAS CONTAINER ─────────────────── */}
            <motion.div
                layout
                className={`
          relative z-10 flex-1 rounded-xl border ${borderColor} 
          bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-y-auto no-scrollbar
          p-6 transition-colors duration-700
        `}
            >
                {isThinking && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-purple-400 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        GENERATING DREAMSCAPE...
                    </div>
                )}

                {/* ─── RENDERER ────────────────────────────── */}
                <div className="space-y-6 max-w-4xl mx-auto">
                    {activeScene.length === 0 ? (
                        <div className="flex h-[400px] items-center justify-center text-gray-600">
                            Waiting for Neural Input...
                        </div>
                    ) : (
                        activeScene.map((node, i) => {
                            const Comp = tamboComponentMap[node.component];
                            if (!Comp) return null;

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Comp {...node.props} />
                                </motion.div>
                            );
                        })
                    )}
                </div>

            </motion.div>

            {/* ─── STATS BAR OSCILLOSCOPE (DECORATIVE) ──── */}
            <div className="h-6 mt-4 flex items-center justify-between text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                <span>LOC: {meta.location}</span>
                <span>DANGER: {meta.dangerLevel}%</span>
                <span>TURN: {meta.turn}</span>
            </div>
        </div>
    );
}
