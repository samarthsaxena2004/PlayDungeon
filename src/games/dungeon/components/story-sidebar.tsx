'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MessageSquare, X, Scroll, Swords, Sparkles, MapPin } from 'lucide-react';
import type { StoryEntry } from '@/lib/game-types';

interface StorySidebarProps {
  storyLog: StoryEntry[];
  isGenerating?: boolean;
}

const typeIcons = {
  narration: Scroll,
  dialogue: MessageSquare,
  discovery: Sparkles,
  combat: Swords,
  milestone: MapPin,
};

const typeColors = {
  narration: 'text-muted-foreground',
  dialogue: 'text-accent',
  discovery: 'text-warning',
  combat: 'text-destructive',
  milestone: 'text-health',
};

export function StorySidebar({ storyLog, isGenerating }: StorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyLog, isOpen]);
  
  return (
    <>
      {/* Emergency Button / Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute bottom-4 left-4 z-30
          w-12 h-12 rounded-full
          flex items-center justify-center
          border-3 border-warning bg-warning/90 text-background
          shadow-lg shadow-warning/30
          transition-colors
          ${isOpen ? 'opacity-50' : ''}
        `}
        aria-label="Toggle Story Log"
      >
        <AlertCircle className="w-6 h-6" />
        
        {/* Notification dot for new entries */}
        {storyLog.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-destructive-foreground">
            {storyLog.length > 9 ? '9+' : storyLog.length}
          </span>
        )}
      </motion.button>
      
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-20 bg-background/50 backdrop-blur-sm"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-30 w-80 bg-card border-r border-border shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Scroll className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm uppercase tracking-wider">Story Log</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Story entries */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ height: 'calc(100vh - 64px)' }}
              >
                {storyLog.map((entry, index) => {
                  const Icon = typeIcons[entry.type];
                  const colorClass = typeColors[entry.type];
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex gap-2"
                    >
                      <Icon className={`w-4 h-4 mt-1 shrink-0 ${colorClass}`} />
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed text-foreground/90">
                          {entry.text}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                
                {isGenerating && (
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                    <span className="text-sm italic">Generating story...</span>
                  </div>
                )}
                
                {storyLog.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Your adventure awaits...
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
