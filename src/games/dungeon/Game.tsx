'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useGameEngine } from '@/games/dungeon/hooks/use-game-engine';
import { useGameStore } from '@/game/store';
import { useGameSounds } from '@/games/dungeon/hooks/use-game-sounds';
import { GameRenderer } from '@/games/dungeon/components/game-renderer';
import { ActionButtons } from '@/games/dungeon/components/action-buttons';
import { Minimap } from '@/games/dungeon/components/minimap';
import { QuestPanel } from '@/games/dungeon/components/quest-panel';
import { HealthBar } from '@/games/dungeon/components/health-bar';
import { GameOverScreen } from '@/games/dungeon/components/game-over-screen';
import { DamageOverlay } from '@/games/dungeon/components/damage-overlay';
import { StoreModal, type StoreItem } from '@/games/dungeon/components/store-modal';
import dynamic from 'next/dynamic';

const TamboGameChat = dynamic(
  () => import('@/games/dungeon/components/tambo-game-chat').then((mod) => mod.TamboGameChat),
  { ssr: false }
);
import { TamboProviderWrapper } from '@/games/dungeon/components/tambo-provider-wrapper';
import { AnimatedBackdrop } from '@/games/dungeon/components/animated-backdrop';
import { NotificationBar } from '@/games/dungeon/components/notification-bar';
import { VoiceControl } from '@/games/dungeon/components/voice-control';
import { StoryPopup } from '@/games/dungeon/components/story-popup';
// import { NarrativeOverlay } from '@/games/dungeon/components/narrative-overlay'; // Reverted
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ShoppingBag, MessageCircle, Sparkles, Zap, ArrowLeft } from 'lucide-react';
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
  const { setActiveGame, stats, updateStats } = useGameStore();
  const { state, dispatch, setControl, attack, interact, resetGame, startGame, stopGame, addStoryEntry, applyAIAction } = useGameEngine(1, stats.gold);

  // Sync engine coins back to global store
  useEffect(() => {
    if (state.coins !== stats.gold) {
      updateStats({ gold: state.coins });
    }
  }, [state.coins, updateStats, stats.gold]);
  const {
    initializeAudio,
    playSound,
    startMusic,
    stopMusic,
    toggleMute,
    isMuted,
    isInitialized: audioInitialized
  } = useGameSounds();

  const [gameStarted, setGameStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showTamboChat, setShowTamboChat] = useState(false);
  const [directorActive, setDirectorActive] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const lastDirectorTimeRef = useRef<number>(0);
  const lastHealthRef = useRef(100);
  const lastEnemyCountRef = useRef(0);
  const lastLevelRef = useRef(1);

  // Sound effects based on game state changes
  useEffect(() => {
    if (!gameStarted || !audioInitialized) return;

    // Player took damage
    if (state.player.health < lastHealthRef.current) {
      playSound('playerHurt', 0.1);
    }
    lastHealthRef.current = state.player.health;

    // Enemy defeated
    if (state.enemies.length < lastEnemyCountRef.current) {
      playSound('enemyDeath', 0.15);
    }
    lastEnemyCountRef.current = state.enemies.length;

    // Level up
    if (state.level > lastLevelRef.current) {
      playSound('levelUp');
      lastLevelRef.current = state.level;
    }

    // Game over or victory
    if (state.gameStatus === 'gameover') {
      stopMusic();
      playSound('gameOver');
    } else if (state.gameStatus === 'victory') {
      stopMusic();
      playSound('victory');
    }
  }, [state.player.health, state.enemies.length, state.level, state.gameStatus, gameStarted, audioInitialized, playSound, stopMusic]);

  // Handle attack with sound
  const handleAttack = useCallback(() => {
    if (state.player.attackCooldown <= 0) {
      attack();
      playSound('fireball', 0.2);
    }
  }, [attack, playSound, state.player.attackCooldown]);

  // Voice control handlers
  const handleVoiceMove = useCallback((direction: 'up' | 'down' | 'left' | 'right', steps: number) => {
    for (let i = 0; i < steps; i++) {
      setControl(direction, true);
    }
    setTimeout(() => setControl(direction, false), 50);
  }, [setControl]);

  const handleVoiceTurn = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setControl(direction, true);
    setTimeout(() => setControl(direction, false), 50);
  }, [setControl]);

  const handleVoiceAttack = useCallback((count: number) => {
    handleAttack();
  }, [handleAttack]);

  const handleVoiceStop = useCallback(() => {
    setControl('up', false);
    setControl('down', false);
    setControl('left', false);
    setControl('right', false);
  }, [setControl]);

  const handleInteract = useCallback(() => {
    interact();
    const nearbyMilestone = state.milestones.find(m => {
      if (m.collected) return false;
      const dx = state.player.x - m.x;
      const dy = state.player.y - m.y;
      return Math.sqrt(dx * dx + dy * dy) < m.interactionRadius;
    });

    if (nearbyMilestone) {
      if (nearbyMilestone.type === 'npc') {
        playSound('npcTalk');
      } else if (nearbyMilestone.type === 'portal') {
        playSound('portal', 0.05);
      } else {
        playSound('pickup', 0.1);
      }
    }
  }, [interact, playSound, state.milestones, state.player.x, state.player.y]);

  // Handle keyboard input
  useEffect(() => {
    if (!gameStarted) return;
    const isTyping = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const key = e.key.toLowerCase();
      const control = KEY_MAP[key];

      if (control) {
        e.preventDefault();
        if (control === 'attack') {
          handleAttack();
        } else if (control === 'interact') {
          handleInteract();
        } else {
          setControl(control, true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
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
  }, [gameStarted, setControl, handleAttack, handleInteract]);


  // AI DIRECTOR LOGIC
  const runDirector = useCallback(async (triggerEvent?: string) => {
    const now = Date.now();
    // Cooldown: 15 seconds
    if (now - lastDirectorTimeRef.current < 15000) return;

    lastDirectorTimeRef.current = now;
    setDirectorActive(true);

    try {
      const response = await fetch('/api/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerState: {
            health: state.player.health,
            gold: state.coins,
            x: state.player.x,
            y: state.player.y
          },
          metrics: {
            kills: state.score / 100, // Roughly
            timeAlive: 60 // Mock for now
          },

          mapState: {}, // Add map analysis here later
          triggerEvent
        })
      });

      if (response.ok) {
        const { toolCalls } = await response.json();
        if (toolCalls && Array.isArray(toolCalls)) {
          toolCalls.forEach((tc: any) => {
            if (tc.function) {
              try {
                const args = JSON.parse(tc.function.arguments);
                applyAIAction(tc.function.name, args);
                playSound('storyNotification'); // Feedback for Director action
              } catch (e) { console.error(e); }
            }
          });
        }
      }
    } catch (e) {
      console.error("Director offline:", e);
    } finally {
      setDirectorActive(false);
    }

  }, [state.player.health, state.coins, state.player.x, state.player.y, state.score, applyAIAction, playSound]);

  // Director Trigger Watcher (Event Driven)
  useEffect(() => {
    if (state.directorTrigger) {
      runDirector(state.directorTrigger);
      dispatch({ type: 'CLEAR_DIRECTOR_TRIGGER' });
    }
  }, [state.directorTrigger, runDirector, dispatch]);

  // Director Loop
  useEffect(() => {
    if (!gameStarted || state.gameStatus !== 'playing') return;

    // Trigger immediate analysis on start
    if (state.level === 1 && state.storyLog.length === 1) {
      runDirector('game_start');
    }

    const interval = setInterval(runDirector, 5000); // Check every 5s, but throttled inside
    return () => clearInterval(interval);
  }, [gameStarted, state.gameStatus, runDirector, state.level, state.storyLog.length]);


  const handlePurchase = useCallback((item: StoreItem) => {
    dispatch({
      type: 'PURCHASE_ITEM',
      item: {
        type: item.type,
        cost: item.cost,
        value: item.value,
        duration: item.duration
      }
    });
    playSound('pickup');
  }, [dispatch, playSound]);

  const [gameInstanceId, setGameInstanceId] = useState(0);

  const handleStart = useCallback(() => {
    let finalName = playerName.trim();
    if (!finalName) {
      finalName = 'Adventurer';
      setPlayerName('Adventurer');
    }
    initializeAudio();
    setGameStarted(true);
    startGame();
    setTimeout(() => startMusic(), 100);
  }, [startGame, initializeAudio, startMusic, playerName]);

  const handleRestart = useCallback(() => {
    resetGame();
    setGameInstanceId(prev => prev + 1);
    setGameStarted(true);
    lastHealthRef.current = 100;
    lastEnemyCountRef.current = 0;
    startMusic();
  }, [resetGame, startMusic]);

  // Story notification sound
  const handleStoryShown = useCallback(() => {
    playSound('storyNotification');
  }, [playSound]);

  const handleDangerAlert = useCallback(() => {
    playSound('danger');
  }, [playSound]);

  const canInteract = state.milestones.some(m => {
    if (m.collected) return false;
    const dx = state.player.x - m.x;
    const dy = state.player.y - m.y;
    return Math.sqrt(dx * dx + dy * dy) < m.interactionRadius;
  });

  const canAttack = state.player.attackCooldown <= 0;

  useEffect(() => {
    return () => {
      stopGame();
      stopMusic();
    };
  }, [stopGame, stopMusic]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
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
            Procedural Roguelite with AI Director.
          </p>

          <div className="mb-6 space-y-4 bg-card/50 p-6 rounded-lg border border-border">
            <div className="space-y-2">
              <label htmlFor="playerName" className="text-sm font-medium text-muted-foreground block text-left">
                Hero Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Adventurer"
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleStart}
              className="gap-2 w-full"
            >
              <Play className="w-5 h-5" />
              Start Game
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Game context for Tambo Chat
  const tamboGameState = {
    health: state.player.health,
    maxHealth: state.player.maxHealth,
    level: state.level,
    score: state.score,
    enemiesNearby: state.enemies.filter(e => e.isAggro).length,
    enemiesDefeated: state.currentQuests.find(q => q.id === 'defeat-enemies')?.progress || 0,
    currentQuest: state.currentQuests.find(q => !q.completed)?.title || 'Explore',
    playerName: playerName || 'Adventurer',
  };

  return (
    <TamboProviderWrapper
      gameState={tamboGameState}
      onAttack={handleAttack}
      onInteract={handleInteract}
      onToggleMute={toggleMute}
    >
      <div className="absolute inset-0 overflow-hidden select-none">
        <AnimatedBackdrop />

        {/* Back Button - Outside Game Container */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/40 border-white/10 hover:bg-black/80 hover:border-white/50 text-white backdrop-blur-sm transition-all shadow-xl"
            onClick={() => {
              stopGame();
              setGameStarted(false);
            }}
            title="Back to Menu"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
          <div
            className="relative w-full h-full max-w-[1200px] max-h-[900px] rounded-lg overflow-hidden shadow-2xl shadow-black/50"
            style={{ aspectRatio: '4/3' }}
          >
            <div className="absolute inset-0 border-4 border-border/50 rounded-lg pointer-events-none z-30" />
            <div className="absolute inset-0 rounded-lg pointer-events-none z-30 bg-gradient-to-b from-foreground/5 to-transparent" style={{ height: '30%' }} />

            <div className="absolute inset-0 bg-background">
              <GameRenderer state={state} />
            </div>

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
              onAttack={handleAttack}
              onInteract={handleInteract}
              canAttack={canAttack}
              canInteract={canInteract}
            />



            <div className="absolute bottom-8 left-8 z-40">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full px-6 py-6 border-2 border-yellow-500/50 shadow-lg bg-black/80 hover:bg-black/90 flex items-center gap-3 transition-transform hover:scale-105"
                onClick={() => setShowShop(true)}
              >
                <div className="bg-yellow-500/20 p-2 rounded-full">
                  <ShoppingBag className="text-yellow-400 w-5 h-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">The Shop</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-mono font-bold text-white leading-none">{state.coins}</span>
                    <span className="text-xs text-yellow-500/70">GP</span>
                  </div>
                </div>
              </Button>
            </div>

            <StoreModal
              isOpen={showShop}
              onClose={() => setShowShop(false)}
              coins={state.coins}
              onPurchase={handlePurchase}
            />

            {/* Inline Story Popup - RESTORED */}
            <StoryPopup
              storyLog={state.storyLog}
              onStoryShown={handleStoryShown}
            />

            {/* AI Director Status Indicator */}
            {directorActive && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-red-500 px-3 py-1 rounded-full text-xs font-mono border border-red-500/30 flex items-center gap-2">
                <Zap className="w-3 h-3 animate-pulse" />
                DIRECTOR ACTIVE
              </div>
            )}

            <NotificationBar
              gameState={state}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onDangerAlert={handleDangerAlert}
            />

            <div className="fixed top-48 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
              <div className="pointer-events-auto">
                <VoiceControl
                  onMove={handleVoiceMove}
                  onTurn={handleVoiceTurn}
                  onAttack={handleVoiceAttack}
                  onInteract={handleInteract}
                  onStop={handleVoiceStop}
                  onComplexCommand={async (text) => {
                    // VOICE INTENT UPGRADE: Route ambiguous commands to Tambo
                    try {
                      const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          message: text,
                          gameContext: tamboGameState
                        }),
                      });

                      if (response.ok) {
                        const { reply, toolCalls } = await response.json();

                        // Execute any tools Tambo decided on
                        if (toolCalls && Array.isArray(toolCalls)) {
                          toolCalls.forEach((tc: any) => {
                            if (tc.function) {
                              const args = JSON.parse(tc.function.arguments);
                              applyAIAction(tc.function.name, args);
                            }
                          });
                          playSound('storyNotification');
                        }

                        // Show Tambo's reply as a story log or toast
                        if (reply && reply.trim().length > 0) {
                          addStoryEntry({ text: `Tambo: "${reply}"`, type: 'dialogue' });
                        }
                      }
                    } catch (e) {
                      console.error('Voice intent failed', e);
                    }
                  }}
                  isGameActive={gameStarted && state.gameStatus === 'playing'}
                  isMuted={isMuted}
                  onToggleMute={toggleMute}
                  className="mb-2"
                />
              </div>

              <div className="pointer-events-auto">
                {!showTamboChat && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTamboChat(true)}
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-card/90 backdrop-blur-sm border border-border text-foreground hover:bg-muted relative"
                    title="Tambo AI Guide"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full flex items-center justify-center">
                      <Sparkles className="w-1.5 h-1.5 text-primary-foreground" />
                    </span>
                  </motion.button>
                )}
              </div>
            </div>

            <TamboGameChat
              isOpen={showTamboChat}
              onClose={() => setShowTamboChat(false)}
              gameContext={{ ...tamboGameState, playerX: state.player.x, playerY: state.player.y }}
              onGameAction={(action) => {
                if (action === 'attack') handleAttack();
                else if (action === 'interact') handleInteract();
              }}
              onCommand={(command) => {
                switch (command.type) {
                  case 'move':
                    if (command.direction && ['up', 'down', 'left', 'right'].includes(command.direction)) {
                      handleVoiceMove(command.direction as 'up' | 'down' | 'left' | 'right', command.count || 1);
                    }
                    break;
                  case 'turn':
                    if (command.direction && ['up', 'down', 'left', 'right'].includes(command.direction)) {
                      handleVoiceTurn(command.direction as 'up' | 'down' | 'left' | 'right');
                    }
                    break;
                  case 'attack':
                    handleVoiceAttack(command.count || 1);
                    break;
                  case 'interact':
                    handleInteract();
                    break;
                  case 'stop':
                    handleVoiceStop();
                    break;
                }
              }}
              className="shadow-xl"
            />

            <DamageOverlay
              key={`damage-overlay-${gameInstanceId}`}
              health={state.player.health}
              maxHealth={state.player.maxHealth}
              lastDamageTime={state.player.lastDamageTime}
            />

            <GameOverScreen
              isGameOver={state.gameStatus === 'gameover'}
              isVictory={state.gameStatus === 'victory'}
              score={state.score}
              level={state.level}
              onRestart={handleRestart}
            />

            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 md:hidden">
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Use WASD or arrows to move
              </p>
            </div>
          </div>
        </div>
      </div>
    </TamboProviderWrapper >
  );
}
