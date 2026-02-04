'use client';

import { motion } from 'framer-motion';
import { Flame, Hand, Gamepad2 } from 'lucide-react';
import { useState } from 'react';

interface ActionButtonsProps {
  onAttack: () => void;
  onInteract: () => void;
  canAttack: boolean;
  canInteract: boolean;
}

export function ActionButtons({ onAttack, onInteract, canAttack, canInteract }: ActionButtonsProps) {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-3 items-end">
      {/* Compact help toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHelp(!showHelp)}
        className="w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle controls help"
      >
        <Gamepad2 className="w-4 h-4" />
      </motion.button>
      
      {/* Collapsible keyboard shortcuts */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: showHelp ? 1 : 0, 
          height: showHelp ? 'auto' : 0,
          marginBottom: showHelp ? 0 : -8
        }}
        className="bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden"
      >
        <div className="px-3 py-2 space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-muted-foreground">Move</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono border border-border">WASD</kbd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-muted-foreground">Attack</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono border border-border">SPACE</kbd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-muted-foreground">Interact</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono border border-border">E</kbd>
          </div>
        </div>
      </motion.div>
      
      {/* Interact Button - cleaner design */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onInteract}
        disabled={!canInteract}
        className={`
          relative w-14 h-14 rounded-full 
          flex flex-col items-center justify-center gap-0.5
          border-3 transition-all duration-200
          ${canInteract 
            ? 'bg-accent/90 border-accent text-accent-foreground shadow-lg shadow-accent/30 hover:shadow-accent/50' 
            : 'bg-muted/50 border-muted-foreground/30 text-muted-foreground cursor-not-allowed'
          }
        `}
        aria-label="Interact (E)"
      >
        <Hand className="w-5 h-5" />
        <span className="text-[8px] font-bold tracking-wide">E</span>
      </motion.button>
      
      {/* Attack Button - cleaner design with integrated key hint */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        onClick={onAttack}
        disabled={!canAttack}
        className={`
          relative w-20 h-20 rounded-full 
          flex flex-col items-center justify-center gap-1
          border-4 transition-all duration-200
          ${canAttack 
            ? 'bg-destructive/90 border-destructive text-destructive-foreground shadow-xl shadow-destructive/40 hover:shadow-destructive/60' 
            : 'bg-muted/50 border-muted-foreground/30 text-muted-foreground cursor-not-allowed'
          }
        `}
        aria-label="Attack (Space)"
      >
        <Flame className="w-8 h-8" />
        <span className="text-[9px] font-bold tracking-wider opacity-80">SPACE</span>
        
        {/* Cooldown indicator */}
        {!canAttack && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-full border-4 border-destructive"
          />
        )}
      </motion.button>
    </div>
  );
}
