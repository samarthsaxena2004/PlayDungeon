"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, User } from "lucide-react";

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    avatar?: string;
}

const mockData: LeaderboardEntry[] = [
    { rank: 1, name: "CryptoCrawler", score: 15420 },
    { rank: 2, name: "DungeonMaster99", score: 12850 },
    { rank: 3, name: "TamboFan", score: 11200 },
    { rank: 4, name: "ReactRonin", score: 9500 },
    { rank: 5, name: "LootGoblin", score: 8750 },
];

export default function Leaderboard() {
    return (
        <div className="w-full max-w-md mx-auto bg-black border border-[#00FF9D]/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,157,0.1)] font-sans">
            <div className="bg-[#001A10] p-4 border-b border-[#00FF9D]/20 flex items-center justify-between">
                <h3 className="text-[#00FF9D] font-bold text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    LEADERBOARD
                </h3>
                <span className="text-xs text-[#00FF9D]/60 uppercase tracking-wider">Top Keepers</span>
            </div>

            <div className="p-4 space-y-2">
                {mockData.map((entry, index) => (
                    <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? "bg-[#00FF9D]/10 border border-[#00FF9D]/20" : "bg-white/5 hover:bg-white/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${index === 0 ? "bg-[#00FF9D] text-black" : "bg-gray-800 text-gray-400"
                                }`}>
                                {entry.rank}
                            </div>
                            <div className="flex flex-col">
                                <span className={`font-medium ${index === 0 ? "text-white" : "text-gray-300"}`}>
                                    {entry.name}
                                </span>
                                {index === 0 && (
                                    <span className="text-[10px] text-[#00FF9D]">Current Champion</span>
                                )}
                            </div>
                        </div>

                        <div className="font-mono text-[#00FF9D]">
                            {entry.score.toLocaleString()}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="px-4 py-3 bg-[#001A10] border-t border-[#00FF9D]/20 text-center">
                <p className="text-xs text-gray-500">
                    Powered by <span className="text-[#00FF9D]">Tambo</span> • Live Updates
                </p>
            </div>
        </div>
    );
}
