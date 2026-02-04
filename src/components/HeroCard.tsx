"use client";

import { motion } from "framer-motion";
import { Zap, Heart } from "lucide-react";

type Props = {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
};

export function HeroCard({ health, maxHealth, mana, maxMana }: Props) {
    const hpPercent = (health / maxHealth) * 100;
    const mpPercent = (mana / maxMana) * 100;

    return (
        <div className="glass-panel p-4 rounded-xl border border-white/10 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold tracking-widest text-gray-400">HERO STATUS</h3>
                <div className="text-xs text-gray-600 font-mono">Lvl 1</div>
            </div>

            {/* HEALTH */}
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1 text-red-400 font-bold">
                    <span className="flex items-center gap-1"><Heart size={12} /> VIT</span>
                    <span>{health}/{maxHealth}</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-red-900/30">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${hpPercent}%` }}
                        className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500"
                    />
                </div>
            </div>

            {/* MANA */}
            <div>
                <div className="flex justify-between text-xs mb-1 text-cyan-400 font-bold">
                    <span className="flex items-center gap-1"><Zap size={12} /> NRG</span>
                    <span>{mana}/{maxMana}</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-cyan-900/30">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${mpPercent}%` }}
                        className="h-full bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-500"
                    />
                </div>
            </div>
        </div>
    );
}

import { z } from "zod";

(HeroCard as any).propsSchema = z.object({
    health: z.number(),
    maxHealth: z.number(),
    mana: z.number(),
    maxMana: z.number(),
});
