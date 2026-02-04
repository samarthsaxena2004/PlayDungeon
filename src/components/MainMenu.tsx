"use client";

import { useGameStore } from "@/game/store";
import { motion } from "framer-motion";
import { Sword, Gamepad2, Ghost, Box, Play } from "lucide-react";

export function MainMenu() {
    const setActiveGame = useGameStore((s) => s.setActiveGame);

    const GAMES = [
        {
            id: "dungeon",
            title: "DEEP DUNGEON",
            desc: "Classic RPG. Loot, fight, survive.",
            icon: Sword,
            color: "from-red-900 to-black",
            border: "border-red-500",
            playable: true,
        },
        {
            id: "maze",
            title: "NEURAL MAZE",
            desc: "Solve the AI-generated labyrinth.",
            icon: Box,
            color: "from-blue-900 to-black",
            border: "border-blue-500",
            playable: true, // We'll stub this
        },
        {
            id: "pigeon",
            title: "CYBER PIGEON",
            desc: "Survive the neon city skies.",
            icon: Gamepad2,
            color: "from-purple-900 to-black",
            border: "border-purple-500",
            playable: true,
        },
        {
            id: "piggy",
            title: "SHADOW PIGGY",
            desc: "Don't let it catch you.",
            icon: Ghost,
            color: "from-green-900 to-black",
            border: "border-green-500",
            playable: true,
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden">

            {/* Background Grid */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            <div className="z-10 text-center mb-12">
                <h1 className="text-6xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    PLAY DUNGEON
                </h1>
                <p className="text-xl text-gray-400 font-mono tracking-widest">ARCADE SYSTEMS v2.0</p>
            </div>

            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                {GAMES.map((game) => (
                    <motion.button
                        key={game.id}
                        onClick={() => game.playable && setActiveGame(game.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!game.playable}
                        className={`
                        relative group overflow-hidden rounded-2xl border ${game.border} p-6 h-48 text-left
                        bg-gradient-to-br ${game.color}
                        transition-all duration-300
                        ${!game.playable ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
                    `}
                    >
                        <div className="absolute top-4 right-4">
                            <game.icon size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex flex-col justify-end h-full relative z-10">
                            <h2 className="text-3xl font-bold uppercase italic">{game.title}</h2>
                            <p className="text-sm text-gray-300 font-mono mt-2">{game.desc}</p>

                            {game.playable ? (
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full text-white group-hover:bg-white group-hover:text-black transition-colors">
                                    <Play size={10} fill="currentColor" /> INSERT COIN
                                </div>
                            ) : (
                                <div className="mt-4 text-xs font-bold text-gray-500">COMING SOON</div>
                            )}
                        </div>

                        {/* Scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
                    </motion.button>
                ))}
            </div>

        </div>
    );
}
