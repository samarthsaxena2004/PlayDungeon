'use client';

import React from "react"

import { z } from 'zod';
import type { TamboComponent } from '@tambo-ai/react';
import { motion } from 'framer-motion';
import { Heart, Sword, Shield, Map, Target, Flame, Footprints, Sparkles, AlertTriangle, Trophy, Skull, User, ArrowLeft } from 'lucide-react';

// ============================================
// 1. PLAYER STATS CARD - Shows current player status
// ============================================
const PlayerStatsPropsSchema = z.object({
  health: z.number().describe('Current health points'),
  maxHealth: z.number().describe('Maximum health points'),
  level: z.number().describe('Current dungeon level'),
  score: z.number().describe('Current score'),
  enemiesDefeated: z.number().describe('Number of enemies defeated'),
});

type PlayerStatsProps = z.infer<typeof PlayerStatsPropsSchema>;

function PlayerStatsCard({ health, maxHealth, level, score, enemiesDefeated }: PlayerStatsProps) {
  const healthPercent = (health / maxHealth) * 100;
  const healthColor = healthPercent > 60 ? 'bg-green-500' : healthPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <User className="w-5 h-5 text-primary" />
        Player Status
      </div>

      {/* Health Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Heart className="w-4 h-4 text-red-500" /> Health
          </span>
          <span className="font-mono">{health}/{maxHealth}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthPercent}%` }}
            className={`h-full ${healthColor} transition-all`}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted/50 rounded p-2">
          <div className="text-xs text-muted-foreground">Level</div>
          <div className="font-bold text-primary">{level}</div>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="font-bold text-accent">{score}</div>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <div className="text-xs text-muted-foreground">Kills</div>
          <div className="font-bold text-destructive">{enemiesDefeated}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// 2. ENEMY INFO CARD - Shows info about enemies
// ============================================
const EnemyInfoPropsSchema = z.object({
  enemyType: z.enum(['slime', 'skeleton', 'ghost', 'boss']).describe('Type of enemy'),
  count: z.number().describe('Number of this enemy type nearby'),
  isAggressive: z.boolean().describe('Whether the enemy is currently aggressive'),
  tip: z.string().describe('Combat tip for this enemy'),
});

type EnemyInfoProps = z.infer<typeof EnemyInfoPropsSchema>;

function EnemyInfoCard({ enemyType, count, isAggressive, tip }: EnemyInfoProps) {
  const enemyIcons: Record<string, string> = {
    slime: '🟢',
    skeleton: '💀',
    ghost: '👻',
    boss: '👹',
  };

  const enemyColors: Record<string, string> = {
    slime: 'border-green-500/50 bg-green-500/10',
    skeleton: 'border-gray-400/50 bg-gray-400/10',
    ghost: 'border-blue-400/50 bg-blue-400/10',
    boss: 'border-red-500/50 bg-red-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-2 rounded-lg p-4 ${enemyColors[enemyType]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{enemyIcons[enemyType]}</span>
          <span className="font-bold capitalize text-foreground">{enemyType}</span>
        </div>
        {isAggressive && (
          <span className="flex items-center gap-1 text-xs text-destructive animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Hostile!
          </span>
        )}
      </div>

      <div className="text-sm text-muted-foreground mb-2">
        <Target className="w-4 h-4 inline mr-1" />
        {count} nearby
      </div>

      <div className="text-xs bg-background/50 rounded p-2 border border-border">
        <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
        <span className="text-foreground">{tip}</span>
      </div>
    </motion.div>
  );
}

// ============================================
// 3. STRATEGY ADVICE CARD - Shows tactical advice
// ============================================
const StrategyAdvicePropsSchema = z.object({
  situation: z.string().describe('Current situation description'),
  recommendation: z.string().describe('Recommended action to take'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).describe('Priority level'),
  action: z.enum(['attack', 'dodge', 'explore', 'heal', 'retreat']).describe('Suggested action type'),
});

type StrategyAdviceProps = z.infer<typeof StrategyAdvicePropsSchema>;

function StrategyAdviceCard({ situation, recommendation, priority, action }: StrategyAdviceProps) {
  const priorityColors: Record<string, string> = {
    low: 'border-muted bg-muted/20',
    medium: 'border-blue-500/50 bg-blue-500/10',
    high: 'border-yellow-500/50 bg-yellow-500/10',
    critical: 'border-red-500/50 bg-red-500/10 animate-pulse',
  };

  const actionIcons: Record<string, React.ReactNode> = {
    attack: <Flame className="w-5 h-5 text-destructive" />,
    dodge: <Footprints className="w-5 h-5 text-blue-400" />,
    explore: <Map className="w-5 h-5 text-green-400" />,
    heal: <Heart className="w-5 h-5 text-red-400" />,
    retreat: <Shield className="w-5 h-5 text-yellow-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-2 rounded-lg p-4 ${priorityColors[priority]}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-background rounded-lg">
          {actionIcons[action]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {priority} priority
            </span>
          </div>
          <div className="font-medium text-foreground mb-2">{situation}</div>
          <div className="text-sm text-muted-foreground">{recommendation}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// 4. QUEST PROGRESS CARD - Shows quest status
// ============================================
const QuestProgressPropsSchema = z.object({
  questName: z.string().describe('Name of the quest'),
  description: z.string().describe('Quest description'),
  progress: z.number().describe('Current progress amount'),
  target: z.number().describe('Target amount to complete'),
  isComplete: z.boolean().describe('Whether the quest is complete'),
});

type QuestProgressProps = z.infer<typeof QuestProgressPropsSchema>;

function QuestProgressCard({ questName, description, progress, target, isComplete }: QuestProgressProps) {
  const progressPercent = Math.min((progress / target) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border rounded-lg p-4 ${isComplete ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-card'}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isComplete ? (
          <Trophy className="w-5 h-5 text-green-500" />
        ) : (
          <Target className="w-5 h-5 text-primary" />
        )}
        <span className={`font-semibold ${isComplete ? 'text-green-500 line-through' : 'text-foreground'}`}>
          {questName}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{description}</p>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Progress</span>
          <span className="font-mono">{progress}/{target}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className={`h-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// 5. CONTROLS HELP CARD - Shows game controls
// ============================================
const ControlsHelpPropsSchema = z.object({
  focusControl: z.enum(['movement', 'attack', 'interact', 'all']).describe('Which control to focus on'),
});

type ControlsHelpProps = z.infer<typeof ControlsHelpPropsSchema>;

function ControlsHelpCard({ focusControl }: ControlsHelpProps) {
  const controls = [
    { name: 'movement', keys: ['W', 'A', 'S', 'D'], description: 'Move your character', icon: <Footprints className="w-4 h-4" /> },
    { name: 'attack', keys: ['SPACE'], description: 'Shoot fireball', icon: <Flame className="w-4 h-4" /> },
    { name: 'interact', keys: ['E'], description: 'Interact with objects', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const filtered = focusControl === 'all' ? controls : controls.filter(c => c.name === focusControl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-border rounded-lg p-4 bg-card"
    >
      <div className="flex items-center gap-2 mb-3 text-foreground font-semibold">
        <Sword className="w-5 h-5 text-primary" />
        Controls Guide
      </div>

      <div className="space-y-3">
        {filtered.map((control) => (
          <div key={control.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {control.icon}
              <span className="text-sm text-foreground">{control.description}</span>
            </div>
            <div className="flex gap-1">
              {control.keys.map((key) => (
                <kbd key={key} className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// 6. GAME ACTION CARD - Actionable command card
// ============================================
const GameActionPropsSchema = z.object({
  actionType: z.enum(['attack', 'interact', 'move', 'pause']).describe('Type of action to perform'),
  description: z.string().describe('Description of what will happen'),
  targetInfo: z.string().optional().describe('Information about the target'),
});

type GameActionProps = z.infer<typeof GameActionPropsSchema> & {
  onExecute?: (action: string) => void;
};

function GameActionCard({ actionType, description, targetInfo, onExecute }: GameActionProps) {
  const actionStyles: Record<string, { icon: React.ReactNode; color: string }> = {
    attack: { icon: <Flame className="w-6 h-6" />, color: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground' },
    interact: { icon: <Sparkles className="w-6 h-6" />, color: 'bg-accent hover:bg-accent/80 text-accent-foreground' },
    move: { icon: <Footprints className="w-6 h-6" />, color: 'bg-primary hover:bg-primary/80 text-primary-foreground' },
    pause: { icon: <Shield className="w-6 h-6" />, color: 'bg-muted hover:bg-muted/80 text-foreground' },
  };

  const style = actionStyles[actionType];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onExecute?.(actionType)}
      className={`w-full rounded-lg p-4 flex items-center gap-4 ${style.color} transition-colors`}
    >
      <div className="p-2 bg-background/20 rounded-lg">
        {style.icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-semibold capitalize">{actionType}</div>
        <div className="text-sm opacity-80">{description}</div>
        {targetInfo && (
          <div className="text-xs mt-1 opacity-60">{targetInfo}</div>
        )}
      </div>
    </motion.button>
  );
}

// ============================================
// 7. DANGER ALERT CARD - Warning display
// ============================================
const DangerAlertPropsSchema = z.object({
  alertType: z.enum(['lowHealth', 'enemyNear', 'bossSpawned', 'trapped']).describe('Type of danger alert'),
  message: z.string().describe('Alert message'),
  urgency: z.enum(['warning', 'danger', 'critical']).describe('Urgency level'),
});

type DangerAlertProps = z.infer<typeof DangerAlertPropsSchema>;

function DangerAlertCard({ alertType, message, urgency }: DangerAlertProps) {
  const urgencyStyles: Record<string, string> = {
    warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
    danger: 'border-orange-500 bg-orange-500/10 text-orange-500',
    critical: 'border-red-500 bg-red-500/10 text-red-500 animate-pulse',
  };

  const alertIcons: Record<string, React.ReactNode> = {
    lowHealth: <Heart className="w-5 h-5" />,
    enemyNear: <Skull className="w-5 h-5" />,
    bossSpawned: <AlertTriangle className="w-5 h-5" />,
    trapped: <Shield className="w-5 h-5" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-lg p-4 ${urgencyStyles[urgency]}`}
    >
      <div className="flex items-center gap-3">
        {alertIcons[alertType]}
        <div>
          <div className="font-bold uppercase text-sm tracking-wider">{urgency}</div>
          <div className="text-foreground">{message}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// EXPORT ALL TAMBO COMPONENTS
// ============================================
export const tamboGameComponents: TamboComponent[] = [
  {
    name: 'PlayerStats',
    description: 'Displays current player status including health, level, score, and enemies defeated. Use when the user asks about their stats, health, progress, or current status.',
    component: PlayerStatsCard,
    propsSchema: PlayerStatsPropsSchema,
  },
  {
    name: 'EnemyInfo',
    description: 'Shows information about a specific enemy type including count, behavior, and combat tips. Use when the user asks about enemies, threats, or combat strategies.',
    component: EnemyInfoCard,
    propsSchema: EnemyInfoPropsSchema,
  },
  {
    name: 'StrategyAdvice',
    description: 'Provides tactical advice and recommended actions. Use when the user asks for help, strategy, what to do next, or how to survive.',
    component: StrategyAdviceCard,
    propsSchema: StrategyAdvicePropsSchema,
  },
  {
    name: 'QuestProgress',
    description: 'Shows progress on a specific quest or objective. Use when the user asks about quests, objectives, goals, or what they need to do.',
    component: QuestProgressCard,
    propsSchema: QuestProgressPropsSchema,
  },
  {
    name: 'ControlsHelp',
    description: 'Displays game control instructions. Use when the user asks how to play, controls, keybindings, or how to attack/move/interact.',
    component: ControlsHelpCard,
    propsSchema: ControlsHelpPropsSchema,
  },
  {
    name: 'GameAction',
    description: 'An actionable button card that can trigger game actions. Use when suggesting the user should attack, interact, move, or pause.',
    component: GameActionCard,
    propsSchema: GameActionPropsSchema,
  },
  {
    name: 'DangerAlert',
    description: 'Displays urgent warnings about dangers. Use when warning about low health, nearby enemies, boss spawns, or being trapped.',
    component: DangerAlertCard,
    propsSchema: DangerAlertPropsSchema,
  },
];

export {
  PlayerStatsCard,
  EnemyInfoCard,
  StrategyAdviceCard,
  QuestProgressCard,
  ControlsHelpCard,
  GameActionCard,
  DangerAlertCard,
};
