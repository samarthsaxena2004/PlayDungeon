"use client";

import { motion } from "framer-motion";

type Props = {
    name: string;
    hp: number;
    maxHp: number;
    status?: string;
};

export function EnemyDisplay({ name, hp, maxHp, status }: Props) {
    const hpPercent = (hp / maxHp) * 100;

    return (
        <div className="relative w-full max-w-lg mx-auto my-8 p-6 glass-panel border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)] rounded-xl overflow-hidden">

            {/* Glitchy Background */}
            <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
            <div className="absolute top-0 w-full h-[1px] bg-red-500/50 animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">

                {/* AVATAR PLACEHOLDER - CSS ART */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-24 h-24 mb-4 rounded-full bg-gradient-to-b from-red-900 to-black border-2 border-red-500/50 flex items-center justify-center shadow-inner"
                >
                    <div className="text-4xl">👹</div>
                </motion.div>

                <h2 className="text-2xl font-black uppercase text-red-500 tracking-widest mb-1">{name}</h2>
                <div className="text-xs text-red-300 font-mono mb-4 uppercase tracking-widest">
                    TARGET // {[...Array(5)].map(() => (Math.random() > 0.5 ? "1" : "0"))}
                    {status ? ` // ${status}` : ""}
                </div>

                {/* HP BAR */}
                <div className="w-full h-4 bg-black border border-red-900 rounded-sm relative overflow-hidden">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: `${hpPercent}%` }}
                        className="h-full bg-red-600"
                    />
                    {/* Scanline on bar */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] w-1/2 h-full skew-x-12 animate-[shimmer_2s_infinite]" />
                </div>

                <div className="w-full flex justify-between mt-1 text-[10px] text-red-500 font-mono">
                    <span>HP INTEGRITY</span>
                    <span>{hp}/{maxHp}</span>
                </div>

            </div>
        </div>
    );
}

import { z } from "zod";

(EnemyDisplay as any).propsSchema = z.object({
    name: z.string(), // Changed from number to string to match API (it was name: number in Props type?? will fix that too)
    hp: z.number(),
    maxHp: z.number(),
    status: z.string().optional(),
});
