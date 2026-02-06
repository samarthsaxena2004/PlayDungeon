'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DamageOverlayProps {
  health: number;
  maxHealth: number;
  lastDamageTime: number;
}

export function DamageOverlay({ health, maxHealth, lastDamageTime }: DamageOverlayProps) {
  const [showFlash, setShowFlash] = useState(false);
  const healthPercent = (health / maxHealth) * 100;
  const isLow = healthPercent < 30;
  const isCritical = healthPercent < 15;

  // Trigger flash effect when damage is taken
  useEffect(() => {
    if (lastDamageTime > 0) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [lastDamageTime]);

  return (
    <>
      {/* Damage flash effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 40%, rgba(220, 38, 38, 0.6) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Persistent low health vignette */}
      <AnimatePresence>
        {isLow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: isCritical ? [0.4, 0.7, 0.4] : 0.3,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isCritical ? 0.8 : 0.5,
              repeat: isCritical ? Infinity : 0,
            }}
            className="absolute inset-0 z-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(220, 38, 38, 0.5) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Critical health warning text */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            key="critical-alert"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg shadow-lg border border-destructive">
              <span className="text-sm font-bold uppercase tracking-wider">Low Health - Find Cover!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
