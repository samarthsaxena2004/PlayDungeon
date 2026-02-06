'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  Swords,
  Heart,
  Trophy,
  ChevronUp,
  ChevronDown,
  Shield,
  Zap,
  MapPin
} from 'lucide-react';
import type { GameState } from '@/games/dungeon/lib/game-types';

interface Notification {
  id: string;
  type: 'danger' | 'combat' | 'health' | 'level' | 'achievement' | 'info';
  message: string;
  timestamp: number;
  priority: number;
}

interface NotificationBarProps {
  gameState: GameState;
  isMuted: boolean;
  onToggleMute: () => void;
  onDangerAlert?: () => void;
}

const typeConfig = {
  danger: {
    icon: AlertTriangle,
    bg: 'bg-destructive/90',
    text: 'text-destructive-foreground',
    animate: true,
  },
  combat: {
    icon: Swords,
    bg: 'bg-primary/90',
    text: 'text-primary-foreground',
    animate: false,
  },
  health: {
    icon: Heart,
    bg: 'bg-health/90',
    text: 'text-background',
    animate: false,
  },
  level: {
    icon: Zap,
    bg: 'bg-warning/90',
    text: 'text-background',
    animate: false,
  },
  achievement: {
    icon: Trophy,
    bg: 'bg-accent/90',
    text: 'text-accent-foreground',
    animate: false,
  },
  info: {
    icon: MapPin,
    bg: 'bg-muted/90',
    text: 'text-foreground',
    animate: false,
  },
};

export function NotificationBar({
  gameState,
  isMuted,
  onToggleMute,
  onDangerAlert
}: NotificationBarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const lastHealthRef = useRef(gameState.player.health);
  const lastEnemyCountRef = useRef(gameState.enemies.length);
  const lastLevelRef = useRef(gameState.level);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate notifications based on game state changes
  useEffect(() => {
    const newNotifications: Notification[] = [];
    const now = Date.now();

    // Check for incoming danger (enemies aggro)
    const aggroEnemies = gameState.enemies.filter(e => e.isAggro);
    if (aggroEnemies.length > 0 && gameState.player.health < 50) {
      newNotifications.push({
        id: `danger-${now}`,
        type: 'danger',
        message: `${aggroEnemies.length} ${aggroEnemies.length === 1 ? 'enemy' : 'enemies'} attacking!`,
        timestamp: now,
        priority: 3,
      });
      onDangerAlert?.();
    }

    // Check for health changes
    if (gameState.player.health < lastHealthRef.current) {
      const damage = lastHealthRef.current - gameState.player.health;
      if (gameState.player.health <= 30) {
        newNotifications.push({
          id: `health-critical-${now}`,
          type: 'danger',
          message: `Critical health! ${gameState.player.health}HP remaining`,
          timestamp: now,
          priority: 3,
        });
      } else if (damage >= 10) {
        newNotifications.push({
          id: `health-${now}`,
          type: 'health',
          message: `-${damage} HP (${gameState.player.health}/${gameState.player.maxHealth})`,
          timestamp: now,
          priority: 2,
        });
      }
    }
    lastHealthRef.current = gameState.player.health;

    // Check for enemy defeats
    if (gameState.enemies.length < lastEnemyCountRef.current) {
      const defeated = lastEnemyCountRef.current - gameState.enemies.length;
      newNotifications.push({
        id: `combat-${now}`,
        type: 'combat',
        message: `${defeated} ${defeated === 1 ? 'enemy' : 'enemies'} defeated! +${defeated * 100} pts`,
        timestamp: now,
        priority: 1,
      });

      // Check if all enemies defeated
      if (gameState.enemies.length === 0) {
        newNotifications.push({
          id: `achievement-${now}`,
          type: 'achievement',
          message: 'All enemies cleared! Find the portal!',
          timestamp: now,
          priority: 2,
        });
      }
    }
    lastEnemyCountRef.current = gameState.enemies.length;

    // Check for level changes
    if (gameState.level > lastLevelRef.current) {
      newNotifications.push({
        id: `level-${now}`,
        type: 'level',
        message: `Level ${gameState.level}! Difficulty increased`,
        timestamp: now,
        priority: 3,
      });
    }
    lastLevelRef.current = gameState.level;

    // Add new notifications
    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications].slice(-20));

      // Show highest priority notification
      const highestPriority = newNotifications.reduce((a, b) =>
        a.priority > b.priority ? a : b
      );
      showNotification(highestPriority);
    }
  }, [gameState, onDangerAlert]);

  // Auto-cleanup old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => {
        const remaining = prev.filter(n => now - n.timestamp < 5000); // Remove after 5s
        if (remaining.length !== prev.length) {
          return remaining;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const showNotification = (notification: Notification) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setCurrentNotification(notification);

    notificationTimeoutRef.current = setTimeout(() => {
      setCurrentNotification(null);
    }, 3000);
  };

  const config = currentNotification ? typeConfig[currentNotification.type] : null;
  const Icon = config?.icon;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
      {/* Level and enemies display - compact inline */}
      <div className="flex items-center gap-2 mb-1">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-full px-3 py-1 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-mono text-foreground">LVL {gameState.level}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1">
            <Swords className="w-3 h-3 text-destructive" />
            <span className="text-[10px] font-mono text-foreground">{gameState.enemies.length}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <button
            onClick={onToggleMute}
            className="p-0.5 hover:bg-muted rounded transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Notification display */}
      <div className="flex items-center gap-2">
        {/* Current notification display */}
        <AnimatePresence mode="wait">
          {currentNotification && config && Icon && (
            <motion.div
              key={currentNotification.id}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                ...(config.animate && {
                  scale: [1, 1.02, 1],
                })
              }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{
                duration: 0.2,
                ...(config.animate && {
                  scale: { repeat: Infinity, duration: 0.5 }
                })
              }}
              className={`
                ${config.bg} ${config.text}
                backdrop-blur-sm px-3 py-2 rounded-lg
                flex items-center gap-2 shadow-lg
                max-w-[250px]
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">
                {currentNotification.message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand button for history */}
        {notifications.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground">
              {notifications.length}
            </span>
          </motion.button>
        )}
      </div>

      {/* Expanded notification history */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden max-w-[300px]"
          >
            <div className="p-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Alert History
              </span>
              <button
                onClick={() => setNotifications([])}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {notifications.slice().reverse().map((notif, index) => {
                const notifConfig = typeConfig[notif.type];
                const NotifIcon = notifConfig.icon;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="px-3 py-2 border-b border-border/50 last:border-0 flex items-center gap-2 hover:bg-muted/20"
                  >
                    <NotifIcon className={`w-3 h-3 ${notifConfig.text === 'text-background' ? 'text-foreground' : notifConfig.text}`} />
                    <span className="text-[11px] text-foreground/80 flex-1 truncate">
                      {notif.message}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {formatTime(notif.timestamp)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

function formatTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m`;
}
