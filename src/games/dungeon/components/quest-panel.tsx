'use client';

import { CheckCircle2, Circle, Target } from 'lucide-react';
import type { Quest } from '@/games/dungeon/lib/game-types';

interface QuestPanelProps {
  quests: Quest[];
  level: number;
}

export function QuestPanel({ quests, level }: QuestPanelProps) {
  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Level {level} - Quests
          </span>
        </div>
        
        <div className="space-y-2">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`flex items-start gap-2 ${
                quest.completed ? 'opacity-50' : ''
              }`}
            >
              {quest.completed ? (
                <CheckCircle2 className="w-4 h-4 text-health mt-0.5 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${quest.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {quest.title}
                </div>
                {!quest.completed && quest.target > 1 && (
                  <div className="mt-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {quest.progress} / {quest.target}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
