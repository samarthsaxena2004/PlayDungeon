'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useGameEngine } from '@/games/dungeon/hooks/useGameEngine';
import { GameRenderer } from '@/games/dungeon/components/game-renderer';
import { ActionButtons } from '@/games/dungeon/components/action-buttons';
import { Minimap } from '@/games/dungeon/components/minimap';
import { QuestPanel } from '@/games/dungeon/components/quest-panel';
import { StorySidebar } from '@/games/dungeon/components/story-sidebar';
import { HealthBar } from '@/games/dungeon/components/health-bar';
import { GameOverScreen } from '@/games/dungeon/components/game-over-screen';
import { DamageOverlay } from '@/games/dungeon/components/damage-overlay';
import { AIChatPopup } from '@/games/dungeon/components/ai-chat-popup';
import { AnimatedBackdrop } from '@/games/dungeon/components/animated-backdrop';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type KeyMap = {
    [key: string]: 'up' | 'down' | 'left' | 'right' | 'attack' | 'interact';
};

const KEY_MAP: KeyMap = {
    'w': 'up',
    'arrowup': 'up',
    's': 'down',
    'arrowdown': 'down',
    'a': 'left',
    'arrowleft': 'left',
    'd': 'right',
    'arrowright': 'right',
    ' ': 'attack',
    'e': 'interact',
};

export default function GamePage() {
    const { state, setControl, attack, interact, resetGame, startGame, stopGame, addStoryEntry } = useGameEngine();
    const [gameStarted, setGameStarted] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const lastStoryTriggerRef = useRef<number>(0);
    const storyQueueRef = useRef<string[]>([]);

    // Handle keyboard input
    useEffect(() => {
        if (!gameStarted) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const control = KEY_MAP[key];

            if (control) {
                e.preventDefault();
                if (control === 'attack') {
                    attack();
                } else if (control === 'interact') {
                    interact();
                } else {
                    setControl(control, true);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const control = KEY_MAP[key];

            if (control && control !== 'attack' && control !== 'interact') {
                setControl(control, false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameStarted, setControl, attack, interact]);

    // Generate AI story based on game events
    const generateStory = useCallback(async (context: string) => {
        const now = Date.now();
        // Throttle story generation to once every 10 seconds
        if (now - lastStoryTriggerRef.current < 10000) {
            storyQueueRef.current.push(context);
            return;
        }

        lastStoryTriggerRef.current = now;
        setIsGeneratingStory(true);

        try {
            const recentEvents = state.storyLog.slice(-5).map(e => e.text);
            const response = await fetch('/api/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context,
                    recentEvents,
                    level: state.level,
                    health: state.player.health,
                    enemiesDefeated: state.currentQuests.find(q => q.id === 'defeat-enemies')?.progress || 0,
                }),
            });

            if (response.ok) {
                const { story } = await response.json();
                addStoryEntry({ text: story, type: 'narration' });
            }
        } catch (error) {
            console.error('[v0] Story generation failed:', error);
        } finally {
            setIsGeneratingStory(false);
        }
    }, [state.storyLog, state.level, state.player.health, state.currentQuests, addStoryEntry]);

    // Trigger story on significant events
    useEffect(() => {
        if (!gameStarted || state.gameStatus !== 'playing') return;

        // Check for low health
        if (state.player.health < 30 && state.player.health > 0) {
            const lastLowHealthStory = state.storyLog.find(
                e => e.text.includes('weak') || e.text.includes('fading')
            );
            if (!lastLowHealthStory || Date.now() - lastLowHealthStory.timestamp > 30000) {
                generateStory('Player health is critically low');
            }
        }

        // Check for all enemies defeated
        if (state.enemies.length === 0 && state.currentQuests.find(q => q.id === 'defeat-enemies' && !q.completed)) {
            generateStory('All enemies have been defeated');
        }
    }, [state.player.health, state.enemies.length, state.currentQuests, state.gameStatus, gameStarted, generateStory, state.storyLog]);

    const handleStart = useCallback(() => {
        setGameStarted(true);
        startGame();
        generateStory('Player enters the dungeon');
    }, [startGame, generateStory]);

    const handleRestart = useCallback(() => {
        resetGame();
        setGameStarted(true);
        generateStory('Player enters the dungeon once more');
    }, [resetGame, generateStory]);

    // Check if player can interact with nearby milestone
    const canInteract = state.milestones.some(m => {
        if (m.collected) return false;
        const dx = state.player.x - m.x;
        const dy = state.player.y - m.y;
        return Math.sqrt(dx * dx + dy * dy) < m.interactionRadius;
    });

    const canAttack = state.player.attackCooldown <= 0;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopGame();
        };
    }, [stopGame]);

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    {/* Title */}
                    <motion.h1
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight"
                    >
                        DEEP
                        <span className="text-primary"> DUNGEON</span>
                    </motion.h1>

                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        Explore the procedurally generated dungeon. Defeat enemies with your fireball.
                        Discover milestones. AI narrates your journey.
                    </p>

                    {/* Controls info */}
                    <AnimatePresence>
                        {showControls && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-card border border-border rounded-lg mb-6 text-left overflow-hidden"
                            >
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <h3 className="font-semibold flex items-center gap-2 text-foreground">
                                        <Keyboard className="w-4 h-4 text-primary" />
                                        Game Controls
                                    </h3>
                                </div>

                                {/* Controls Table */}
                                <div className="divide-y divide-border">
                                    {/* Movement */}
                                    <div className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary text-lg">+</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-foreground">Movement</div>
                                                <div className="text-xs text-muted-foreground">Navigate the dungeon</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">W</kbd>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">A</kbd>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">S</kbd>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">D</kbd>
                                        </div>
                                    </div>

                                    {/* Attack */}
                                    <div className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center">
                                                <span className="text-destructive text-lg">*</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-foreground">Fireball Attack</div>
                                                <div className="text-xs text-muted-foreground">Shoot enemies</div>
                                            </div>
                                        </div>
                                        <kbd className="px-3 py-1 bg-muted rounded text-xs font-mono border border-border">SPACE</kbd>
                                    </div>

                                    {/* Interact */}
                                    <div className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                                                <span className="text-accent text-lg">!</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-foreground">Interact</div>
                                                <div className="text-xs text-muted-foreground">Collect items, talk to NPCs</div>
                                            </div>
                                        </div>
                                        <kbd className="px-3 py-1 bg-muted rounded text-xs font-mono border border-border">E</kbd>
                                    </div>

                                    {/* Chat */}
                                    <div className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-warning/10 flex items-center justify-center">
                                                <span className="text-warning text-lg">?</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-foreground">AI Chat</div>
                                                <div className="text-xs text-muted-foreground">Ask AI for guidance</div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">Click chat icon</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-muted/20 border-t border-border">
                                    <p className="text-xs text-muted-foreground text-center">
                                        Touch-friendly buttons also available on screen
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            onClick={handleStart}
                            className="gap-2 w-full"
                        >
                            <Play className="w-5 h-5" />
                            Start Game
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setShowControls(!showControls)}
                            className="gap-2"
                        >
                            <Info className="w-4 h-4" />
                            {showControls ? 'Hide' : 'Show'} Controls
                        </Button>
                    </div>

                    {/* Credits */}
                    <p className="text-xs text-muted-foreground mt-8">
                        Built with Next.js, Framer Motion, and AI SDK
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 overflow-hidden select-none">
            {/* Animated Background */}
            <AnimatedBackdrop />

            {/* Centered 4:3 Game Container */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                <div
                    className="relative w-full h-full max-w-[1200px] max-h-[900px] rounded-lg overflow-hidden shadow-2xl shadow-black/50"
                    style={{ aspectRatio: '4/3' }}
                >
                    {/* CRT-style frame */}
                    <div className="absolute inset-0 border-4 border-border/50 rounded-lg pointer-events-none z-30" />
                    <div className="absolute inset-0 rounded-lg pointer-events-none z-30 bg-gradient-to-b from-foreground/5 to-transparent" style={{ height: '30%' }} />

                    {/* Game Canvas */}
                    <div className="absolute inset-0 bg-background">
                        <GameRenderer state={state} />
                    </div>

                    {/* HUD Overlays - now positioned within game container */}
                    <HealthBar
                        health={state.player.health}
                        maxHealth={state.player.maxHealth}
                        score={state.score}
                    />

                    <QuestPanel
                        quests={state.currentQuests}
                        level={state.level}
                    />

                    <Minimap state={state} />

                    <ActionButtons
                        onAttack={attack}
                        onInteract={interact}
                        canAttack={canAttack}
                        canInteract={canInteract}
                    />

                    <StorySidebar
                        storyLog={state.storyLog}
                        isGenerating={isGeneratingStory}
                    />

                    {/* Damage screen effect */}
                    <DamageOverlay
                        health={state.player.health}
                        maxHealth={state.player.maxHealth}
                        lastDamageTime={state.player.lastDamageTime}
                    />

                    {/* AI Chat Popup */}
                    <AIChatPopup
                        gameContext={{
                            health: state.player.health,
                            level: state.level,
                            enemiesNearby: state.enemies.filter(e => e.isAggro).length,
                            currentQuest: state.currentQuests.find(q => !q.completed)?.title || 'Explore',
                        }}
                    />

                    {/* Game Over / Victory Screen */}
                    <GameOverScreen
                        isGameOver={state.gameStatus === 'gameover'}
                        isVictory={state.gameStatus === 'victory'}
                        score={state.score}
                        level={state.level}
                        onRestart={handleRestart}
                    />

                    {/* Mobile touch controls hint */}
                    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 md:hidden">
                        <p className="text-[10px] text-muted-foreground/50 text-center">
                            Use WASD or arrows to move
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
