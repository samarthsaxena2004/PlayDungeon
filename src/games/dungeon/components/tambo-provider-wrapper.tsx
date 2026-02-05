'use client';

import React from "react";

interface TamboProviderWrapperProps {
  children: React.ReactNode;
  gameState: {
    health: number;
    maxHealth: number;
    level: number;
    score: number;
    enemiesNearby: number;
    currentQuest: string;
    enemiesDefeated: number;
  };
  onAttack: () => void;
  onInteract: () => void;
  onToggleMute: () => void;
}

// This wrapper provides a context for Tambo integration
// The TamboGameChat component handles its own state and fallback logic
import { TamboProvider } from '@tambo-ai/react';
import { createGameTools, createContextHelpers } from '../lib/tambo-tools';
import { tamboGameComponents } from '../lib/tambo-components';
import { useMemo } from 'react';

// This wrapper provides a context for Tambo integration
// The TamboGameChat component handles its own state and fallback logic
export function TamboProviderWrapper({
  children,
  gameState,
  onAttack,
  onInteract,
  onToggleMute,
}: TamboProviderWrapperProps) {

  // Memoize tools to prevent recreation on every render
  const tools = useMemo(() =>
    createGameTools(onAttack, onInteract, onToggleMute, {
      health: gameState.health,
      level: gameState.level,
      score: gameState.score,
      enemies: gameState.enemiesNearby
    }),
    [onAttack, onInteract, onToggleMute, gameState.health, gameState.level, gameState.score, gameState.enemiesNearby]
  );

  // Derive context helpers
  const context = useMemo(() =>
    createContextHelpers(gameState),
    [gameState]
  );

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY || 'demo-key'}
      tools={tools}
      components={tamboGameComponents}
      contextHelpers={context}
    >
      {children}
    </TamboProvider>
  );
}
