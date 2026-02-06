'use client';

import { useState, useCallback } from 'react';
import { type StoreItem } from '@/games/dungeon/components/store-modal';
import type { GameState } from '@/games/dungeon/lib/game-types';

export type ShopkeeperData = {
    greeting: string;
    priceMultipliers: Record<string, number>;
    isLoading: boolean;
};

export function useShopkeeper() {
    const [data, setData] = useState<ShopkeeperData>({
        greeting: "Welcome, traveler! My prices are... reasonable.",
        priceMultipliers: {},
        isLoading: false,
    });

    const consultShopkeeper = useCallback(async (playerState: GameState['player'], coins: number, level: number) => {
        setData(prev => ({ ...prev, isLoading: true }));

        try {
            // Construct prompt for Tambo
            const prompt = `
        You are Griznag, a goblin shopkeeper in a dungeon.
        Player stats:
        - Health: ${playerState.health} / ${playerState.maxHealth}
        - Coins: ${coins}
        - Level: ${level}
        
        Task:
        1. Write a short, in-character greeting (max 1 sentence). Be greedy if they are rich, sympathetic or predatory if they are low health.
        2. Decide on a price multiplier for items (0.8 to 1.5).
           - If rich (>200 coins), increase prices (1.2 - 1.5).
           - If poor/low health, maybe discount (0.8 - 0.9) to keep them alive (or exploit them!).
        
        Return JSON ONLY:
        {
          "greeting": "string",
          "globalMultiplier": number
        }
      `;

            const response = await fetch('/api/tambo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    format: "json_object"
                }),
            });

            if (!response.ok) throw new Error('Shopkeeper busy');

            const result = await response.json();
            // Parse the content from the AI response
            // Assuming standard chat completion structure, wrapped in our API
            // If the API returns the content string directly or wrapped
            // We'll assume the API returns { result: { ... } } or similar based on previous patterns
            // But actually, for standard Tambo/OpenAI wrappers usually it's `completion.content` or similar.
            // Let's assume the API returns the parsed JSON object if we asked for it, or we parse it.

            let parsed;
            try {
                // Safe parse if it comes as a string property, or use directly if it's already an object
                // Depending on how /api/tambo is implemented. 
                // fallback to mock for now if unsure, but let's try to handle standard case.
                parsed = typeof result === 'string' ? JSON.parse(result) : result;
                // If result has a 'text' or 'content' field
                if (result.text) parsed = JSON.parse(result.text);
                else if (result.content) parsed = JSON.parse(result.content);
            } catch (e) {
                // Fallback manual parsing or defaults
                console.warn("Failed to parse shopkeeper JSON", e);
                parsed = { greeting: "Shiny coins... give them here!", globalMultiplier: 1.0 };
            }

            const multiplier = parsed.globalMultiplier || 1.0;

            setData({
                greeting: parsed.greeting || "Buy something or get out!",
                priceMultipliers: {
                    'health-potion': multiplier,
                    'speed-elixir': multiplier,
                    'power-brew': multiplier,
                },
                isLoading: false,
            });

        } catch (error) {
            console.error('Shopkeeper error:', error);
            setData(prev => ({
                ...prev,
                greeting: "Hmph. Business is slow.",
                isLoading: false
            }));
        }
    }, []);

    return {
        shopkeeperData: data,
        consultShopkeeper
    };
}
