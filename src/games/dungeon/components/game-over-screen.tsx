'use client';

import { motion } from 'framer-motion';
import { Skull, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameOverScreenProps {
  isGameOver: boolean;
  isVictory: boolean;
  score: number;
  level: number;
  onRestart: () => void;
}

export function GameOverScreen({ isGameOver, isVictory, score, level, onRestart }: GameOverScreenProps) {
  if (!isGameOver && !isVictory) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="bg-card border border-border rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl"
      >
        {isVictory ? (
          <>
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block mb-4"
            >
              <Trophy className="w-20 h-20 text-warning" />
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Victory!</h2>
            <p className="text-muted-foreground mb-6">
              You have conquered the dungeon!
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-block mb-4"
            >
              <Skull className="w-20 h-20 text-destructive" />
            </motion.div>
            <h2 className="text-3xl font-bold text-destructive mb-2">Game Over</h2>
            <p className="text-muted-foreground mb-6">
              The dungeon claims another soul...
            </p>
          </>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground font-mono">{score.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Final Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground font-mono">{level}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Level Reached</div>
            </div>
          </div>
        </div>
        
        <Button
          onClick={onRestart}
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}
