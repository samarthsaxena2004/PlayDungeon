'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Radio, Volume2, VolumeX, HelpCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useVoiceCommands, parseVoiceCommand, type VoiceCommand } from '@/games/dungeon/hooks/use-voice-commands';

interface VoiceControlProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right', steps: number) => void;
  onTurn: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onAttack: (count: number) => void;
  onInteract: () => void;
  onStop: () => void;
  isGameActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

const VOICE_HELP = [
  { command: 'Move [direction] [number]', example: '"Move right 10 blocks"', desc: 'Move in a direction' },
  { command: '[Direction] [number]', example: '"Up 5" or "Left three"', desc: 'Quick movement' },
  { command: 'Turn [direction]', example: '"Turn right" or "Face up"', desc: 'Change facing direction' },
  { command: 'Shoot/Attack [number]', example: '"Shoot 5 times" or "Fire"', desc: 'Fire fireballs' },
  { command: 'Interact/Use/Pick up', example: '"Interact" or "Pick up"', desc: 'Interact with objects' },
  { command: 'Stop/Halt', example: '"Stop" or "Wait"', desc: 'Stop current action' },
];

export function VoiceControl({
  onMove,
  onTurn,
  onAttack,
  onInteract,
  onStop,
  isGameActive,
  isMuted,
  onToggleMute,
  className = "",
}: VoiceControlProps & { className?: string }) {
  const [showHelp, setShowHelp] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [commandHistory, setCommandHistory] = useState<{ text: string; success: boolean }[]>([]);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const attackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle parsed voice commands
  const handleCommand = useCallback((command: VoiceCommand) => {
    if (!isGameActive) return;

    // Clear any ongoing actions
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    if (attackIntervalRef.current) clearInterval(attackIntervalRef.current);

    let success = true;
    let actionText = '';

    switch (command.type) {
      case 'move':
        if (command.direction && command.count) {
          actionText = `Moving ${command.direction} ${command.count} blocks`;
          setCurrentAction(actionText);

          // Execute movement over time (simulating block-by-block movement)
          let stepsRemaining = command.count;
          const dir = command.direction;

          // First turn to face direction
          if (['up', 'down', 'left', 'right'].includes(dir)) {
            onTurn(dir as 'up' | 'down' | 'left' | 'right');
          }

          // Then move step by step
          moveIntervalRef.current = setInterval(() => {
            if (stepsRemaining > 0) {
              if (['up', 'down', 'left', 'right'].includes(dir)) {
                onMove(dir as 'up' | 'down' | 'left' | 'right', 1);
              }
              stepsRemaining--;
              setCurrentAction(`Moving ${dir}: ${stepsRemaining} blocks left`);
            } else {
              if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
              setCurrentAction(null);
            }
          }, 100); // Move every 100ms for smooth movement

          // Safety timeout to clear interval after max time
          actionTimeoutRef.current = setTimeout(() => {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
            setCurrentAction(null);
          }, command.count * 150 + 500);
        }
        break;

      case 'turn':
        if (command.direction) {
          actionText = `Turning ${command.direction}`;
          setCurrentAction(actionText);
          if (['up', 'down', 'left', 'right'].includes(command.direction)) {
            onTurn(command.direction as 'up' | 'down' | 'left' | 'right');
          }
          actionTimeoutRef.current = setTimeout(() => setCurrentAction(null), 500);
        }
        break;

      case 'attack':
        const attackCount = command.count || 1;
        actionText = `Firing ${attackCount} fireball${attackCount > 1 ? 's' : ''}`;
        setCurrentAction(actionText);

        let attacksRemaining = attackCount;

        // Fire immediately, then at intervals
        onAttack(1);
        attacksRemaining--;

        if (attacksRemaining > 0) {
          attackIntervalRef.current = setInterval(() => {
            if (attacksRemaining > 0) {
              onAttack(1);
              attacksRemaining--;
              setCurrentAction(`Firing: ${attacksRemaining} shots left`);
            } else {
              if (attackIntervalRef.current) clearInterval(attackIntervalRef.current);
              setCurrentAction(null);
            }
          }, 350); // Fire every 350ms (respecting cooldown)
        }

        actionTimeoutRef.current = setTimeout(() => {
          if (attackIntervalRef.current) clearInterval(attackIntervalRef.current);
          setCurrentAction(null);
        }, attackCount * 400 + 500);
        break;

      case 'interact':
        actionText = 'Interacting';
        setCurrentAction(actionText);
        onInteract();
        actionTimeoutRef.current = setTimeout(() => setCurrentAction(null), 500);
        break;

      case 'stop':
        actionText = 'Stopping';
        setCurrentAction(actionText);
        onStop();
        if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        if (attackIntervalRef.current) clearInterval(attackIntervalRef.current);
        actionTimeoutRef.current = setTimeout(() => setCurrentAction(null), 500);
        break;

      case 'help':
        setShowHelp(true);
        actionText = 'Showing help';
        break;

      case 'unknown':
        success = false;
        actionText = `Unknown: "${command.raw}"`;
        break;
    }

    // Add to history
    setCommandHistory(prev => [
      { text: actionText || command.raw, success },
      ...prev.slice(0, 4)
    ]);

  }, [isGameActive, onMove, onTurn, onAttack, onInteract, onStop]);

  // Handle transcript updates (for visual feedback)
  const handleTranscript = useCallback((text: string) => {
    // Preview what command would be parsed
    const preview = parseVoiceCommand(text);
    if (preview.type !== 'unknown') {
      // Could show preview here
    }
  }, []);

  const {
    isListening,
    isContinuousMode,
    isSupported,
    lastTranscript,
    startListening,
    stopListening,
    toggleContinuousMode,
  } = useVoiceCommands({
    onCommand: handleCommand,
    onTranscript: handleTranscript,
    enabled: isGameActive,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
      if (attackIntervalRef.current) clearInterval(attackIntervalRef.current);
    };
  }, []);

  if (!isSupported) {
    return null; // Voice not supported in this browser
  }

  return (
    <>
      {/* Voice Control Panel - Replaced absolute with className prop */}
      <div className={className || "absolute bottom-36 left-4 z-40"}>
        {/* Collapsed toggle - compact button */}
        {!showPanel && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPanel(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isContinuousMode
              ? 'bg-accent text-accent-foreground animate-pulse'
              : 'bg-card/90 backdrop-blur-sm border border-border text-foreground hover:bg-muted'
              }`}
            title="Voice Control"
          >
            <Mic className="w-4 h-4" />
          </motion.button>
        )}

        {/* Expanded Panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl overflow-hidden w-64"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${isContinuousMode ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">Voice Control</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowHelp(true)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label="Show voice commands help"
                  >
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={onToggleMute}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label="Collapse panel"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Action */}
              {currentAction && (
                <div className="px-3 py-2 bg-accent/10 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-accent font-medium">{currentAction}</span>
                  </div>
                </div>
              )}

              {/* Voice Status */}
              <div className="p-3">
                {/* Transcript display */}
                {isListening && lastTranscript && (
                  <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Hearing:</p>
                    <p className="text-sm text-foreground italic">"{lastTranscript}"</p>
                  </div>
                )}

                {/* Control buttons */}
                <div className="flex gap-2">
                  {/* Push-to-talk button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    disabled={isContinuousMode}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors ${isListening && !isContinuousMode
                      ? 'bg-destructive text-destructive-foreground'
                      : isContinuousMode
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                  >
                    {isListening && !isContinuousMode ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">
                      {isListening && !isContinuousMode ? 'Listening...' : 'Hold to Speak'}
                    </span>
                  </motion.button>

                  {/* Continuous mode toggle */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleContinuousMode}
                    className={`px-3 py-3 rounded-lg transition-colors ${isContinuousMode
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    title={isContinuousMode ? 'Stop hands-free mode' : 'Start hands-free mode'}
                  >
                    <Radio className={`w-5 h-5 ${isContinuousMode ? 'animate-pulse' : ''}`} />
                  </motion.button>
                </div>

                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  {isContinuousMode
                    ? 'Hands-free mode active - speak commands anytime'
                    : 'Hold button to speak or enable hands-free mode'}
                </p>
              </div>

              {/* Command History */}
              {commandHistory.length > 0 && (
                <div className="px-3 pb-3">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Recent:</p>
                  <div className="space-y-1">
                    {commandHistory.slice(0, 3).map((cmd, i) => (
                      <div
                        key={i}
                        className={`text-[10px] px-2 py-1 rounded ${cmd.success
                          ? 'bg-accent/10 text-accent'
                          : 'bg-destructive/10 text-destructive'
                          }`}
                      >
                        {cmd.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" />
                  Voice Commands
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {VOICE_HELP.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-primary">
                        {item.command}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                    <p className="text-[10px] text-foreground/50 italic">e.g., {item.example}</p>
                  </div>
                ))}

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tips:</strong> You can use number words ("five", "ten") or digits.
                    Directions can be "up/down/left/right" or "north/south/west/east" or "forward/backward".
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
