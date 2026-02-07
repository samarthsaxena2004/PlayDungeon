'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, MessageSquare, Sparkles, Swords, MapPin, AlertTriangle, Skull, Crown } from 'lucide-react';
import type { StoryEntry } from '@/games/dungeon/lib/game-types';

interface NarrativeOverlayProps {
    storyLog: StoryEntry[];
    onStoryShown?: () => void;
}

const typeConfig = {
    narration: {
        icon: Scroll,
        color: 'text-blue-400',
        bg: 'bg-blue-950/80',
        border: 'border-blue-500/30',
        sound: 'storyNotification'
    },
    dialogue: {
        icon: MessageSquare,
        color: 'text-purple-400',
        bg: 'bg-purple-950/80',
        border: 'border-purple-500/30',
        sound: 'npcTalk'
    },
    discovery: {
        icon: Sparkles,
        color: 'text-yellow-400',
        bg: 'bg-yellow-950/80',
        border: 'border-yellow-500/30',
        sound: 'pickup'
    },
    combat: {
        icon: Swords,
        color: 'text-red-400',
        bg: 'bg-red-950/80',
        border: 'border-red-500/30',
        sound: 'combatStart'
    },
    milestone: {
        icon: MapPin,
        color: 'text-green-400',
        bg: 'bg-green-950/80',
        border: 'border-green-500/30',
        sound: 'portal'
    },
    danger: {
        icon: AlertTriangle,
        color: 'text-red-500',
        bg: 'bg-red-950/90',
        border: 'border-red-500/50',
        sound: 'danger'
    },
};

export function NarrativeOverlay({ storyLog, onStoryShown }: NarrativeOverlayProps) {
    const [currentEntry, setCurrentEntry] = useState<StoryEntry | null>(null);
    const [queue, setQueue] = useState<StoryEntry[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    // Queue management
    useEffect(() => {
        if (storyLog.length === 0) return;

        const latest = storyLog[storyLog.length - 1];
        // Avoid duplicates
        setQueue(prev => {
            if (prev.find(e => e.id === latest.id) || currentEntry?.id === latest.id) return prev;
            return [...prev, latest];
        });
    }, [storyLog, currentEntry]);

    // Process queue
    useEffect(() => {
        if (!currentEntry && queue.length > 0 && !isPaused) {
            const next = queue[0];
            setQueue(prev => prev.slice(1));
            setCurrentEntry(next);
            onStoryShown?.();

            // Dynamic duration based on text length + type
            const baseTime = next.type === 'danger' ? 5000 : 4000;
            const readTime = next.text.length * 50;
            const duration = Math.max(baseTime, readTime);

            const timer = setTimeout(() => {
                setCurrentEntry(null);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [queue, currentEntry, isPaused, onStoryShown]);

    if (!currentEntry) return null;

    const config = typeConfig[currentEntry.type] || typeConfig.narration;
    const Icon = config.icon;
    const isDirector = currentEntry.text.startsWith('Director:');
    const cleanText = isDirector ? currentEntry.text.replace('Director:', '').trim() : currentEntry.text;

    return (
        <AnimatePresence mode="wait">
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
                <motion.div
                    key={currentEntry.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`
            relative overflow-hidden
            ${config.bg} ${config.border} border
            backdrop-blur-xl shadow-2xl rounded-xl
            p-6 flex items-start gap-4
            pointer-events-auto
          `}
                    // Pause queue on hover
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-20" />

                    {/* Icon Container */}
                    <div className={`
            p-3 rounded-full bg-black/20 shrink-0
            ${config.color} border border-white/10
            shadow-inner
          `}>
                        <Icon className={`w-8 h-8 ${currentEntry.type === 'danger' ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {isDirector && (
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-red-400 mb-1 opacity-80">
                                AI Director Intervention
                            </div>
                        )}

                        <motion.p
                            className="text-lg md:text-xl font-medium text-white leading-relaxed drop-shadow-md font-serif"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {cleanText}
                        </motion.p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                        onClick={() => setCurrentEntry(null)}
                        className="absolute top-2 right-2 text-white/20 hover:text-white/80 transition-colors p-1"
                    >
                        ×
                    </button>

                    {/* Progress Bar (Bottom) */}
                    <motion.div
                        className={`absolute bottom-0 left-0 h-1 ${config.color.replace('text-', 'bg-')}`}
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 4, ease: "linear" }} // Approximate sync
                        style={{ opacity: 0.5 }}
                    />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
