"use client";

import { useGameStore } from "@/game/store";
import { tamboComponentMap } from "@/tambo/registry";
import { motion, AnimatePresence } from "framer-motion";

export function GenerativeCanvas() {
    const { activeScene, meta, isThinking } = useGameStore();

    // ─── 1. EXTRACT KEY COMPONENTS ───
    // We remove them from the generic "flow" list so we can place them explicitly
    const bgNode = activeScene.find(n => n.component === "DungeonCanvas");
    const imgNode = activeScene.find(n => n.component === "BackdropImage");
    const heroNode = activeScene.find(n => n.component === "HeroCard");

    // The rest stay in the flow (Enemies, StoryText, Choices, etc.)
    const flowNodes = activeScene.filter(n =>
        n.component !== "DungeonCanvas" &&
        n.component !== "HeroCard" &&
        n.component !== "BackdropImage"
    );

    // Determine mode based on if an enemy is present
    const isCombat = flowNodes.some(n => n.component === "EnemyDisplay" || n.component === "CombatHUD");
    const borderColor = isCombat ? "border-red-500/50 shadow-red-900/20" : "border-[#333]";

    return (
        <div className="relative h-full flex flex-col p-4 bg-[#050505] overflow-hidden">

            {/* ─── LAYER 0: BACKGROUND ──────────────────────── */}
            <div className="absolute inset-4 rounded-xl overflow-hidden border border-[#222] z-0">

                {/* Priority: Backdrop Image > Dungeon Canvas > Color Fallback */}
                {imgNode ? (
                    <div className="w-full h-full">
                        {(() => {
                            const Comp = tamboComponentMap[imgNode.component];
                            return Comp ? <Comp {...imgNode.props} /> : null;
                        })()}
                    </div>
                ) : bgNode ? (
                    // Render DungeonCanvas as full background
                    <div className="w-full h-full opacity-60">
                        {(() => {
                            const Comp = tamboComponentMap[bgNode.component];
                            return Comp ? <Comp {...bgNode.props} /> : null;
                        })()}
                    </div>
                ) : (
                    <div className="w-full h-full bg-zinc-900/50" />
                )}

                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />
            </div>

            {/* ─── LAYER 1: CONTENT ─────────────────────────── */}
            <div className="relative z-10 flex-1 flex flex-col justify-between pointer-events-none">

                {/* TOP: HERO STATUS */}
                <div className="p-4 pointer-events-auto">
                    <AnimatePresence>
                        {heroNode && (
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -50, opacity: 0 }}
                            >
                                {(() => {
                                    const Comp = tamboComponentMap[heroNode.component];
                                    return Comp ? <Comp {...heroNode.props} /> : null;
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CENTER: FLOW CONTENT (Enemies, Text, Choices) */}
                <div className={`
          flex-1 flex flex-col justify-center items-center overflow-y-auto no-scrollbar
          ${isCombat ? "justify-center" : "justify-end pb-20"}
          pointer-events-auto
        `}>
                    <div className="w-full max-w-2xl space-y-6 px-4">
                        {flowNodes.map((node, i) => {
                            const Comp = tamboComponentMap[node.component];
                            if (!Comp) return null;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-full"
                                >
                                    <Comp {...node.props} />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {isThinking && (
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2 text-xs text-purple-400 animate-pulse bg-black/50 px-3 py-1 rounded-full border border-purple-500/30">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    DREAMING...
                </div>
            )}


        </div>
    );
}
