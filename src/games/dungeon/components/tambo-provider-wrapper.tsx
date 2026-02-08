'use client';

import React, { useEffect } from "react";

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

  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.warn('⚠️ valid NEXT_PUBLIC_TAMBO_API_KEY not found. Chat features may not work correctly.');
      // Create a visible toast/alert for production debugging
      if (typeof window !== 'undefined') {
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff0000;color:white;text-align:center;padding:10px;z-index:9999;font-family:monospace;font-weight:bold;';
        warningDiv.innerText = 'CRITICAL: NEXT_PUBLIC_TAMBO_API_KEY MISSING. CHAT & AI WILL FAIL.';
        document.body.appendChild(warningDiv);
        setTimeout(() => warningDiv.remove(), 10000);
      }
    }
  }, [apiKey]);

  return (
    <TamboProvider
      apiKey={apiKey || 'demo-key'}
      tools={tools}
      components={tamboGameComponents}
      contextHelpers={context}
    >
      {children}
    </TamboProvider>
  );
}
