'use client';

import { Heart } from 'lucide-react';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  score: number;
}

export const HealthBar = memo(function HealthBar({ health, maxHealth, score }: HealthBarProps) {
  const healthPercent = (health / maxHealth) * 100;
  const isLow = healthPercent < 30;
  const isCritical = healthPercent < 15;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg flex items-center gap-4">
        {/* Health */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Heart
              className={`w-5 h-5 ${isCritical
                ? 'text-destructive fill-destructive'
                : isLow
                  ? 'text-warning fill-warning'
                  : 'text-health fill-health'
                }`}
            />
          </motion.div>

          <div className="w-32">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isCritical
                  ? 'bg-destructive'
                  : isLow
                    ? 'bg-warning'
                    : 'bg-health'
                  }`}
                initial={false}
                animate={{ width: `${healthPercent}%` }}
                transition={{ type: 'spring', damping: 15 }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 text-center font-mono">
              {health} / {maxHealth}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Score */}
        <div className="text-center">
          <div className="text-lg font-bold text-foreground font-mono">{score.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
        </div>
      </div>
    </div>
  );
});
