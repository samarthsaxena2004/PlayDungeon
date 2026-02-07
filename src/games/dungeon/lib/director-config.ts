export interface DungeonTheme {
    name: string;
    description: string;
    corridorWidth: number; // 1 = narrow, 2 = standard, 3 = wide
    roomSizeBias: 'small' | 'standard' | 'large';
    enemyDensity: number; // Multiplier for enemy count (0.5 to 2.0)
    specialFeature: 'none' | 'traps' | 'water' | 'darkness';
    visualStyle: 'stone' | 'moss' | 'dark' | 'rich';
}

export const DEFAULT_THEME: DungeonTheme = {
    name: "Standard Dungeon",
    description: "A typical dungeon floor with balanced rooms and corridors.",
    corridorWidth: 2,
    roomSizeBias: "standard",
    enemyDensity: 1.0,
    specialFeature: "none",
    visualStyle: "stone"
};

export const THEME_presets: Record<string, DungeonTheme> = {
    standard: DEFAULT_THEME,
    claustrophobic: {
        name: "Claustrophobic Tunnels",
        description: "Tight, winding passages that make combat dangerous.",
        corridorWidth: 1,
        roomSizeBias: "small",
        enemyDensity: 1.2,
        specialFeature: "darkness",
        visualStyle: "dark"
    },
    grand_halls: {
        name: "Grand Halls",
        description: "Massive chambers connected by wide avenues.",
        corridorWidth: 3,
        roomSizeBias: "large",
        enemyDensity: 0.8, // Fewer but maybe stronger enemies (logic elsewhere)
        specialFeature: "none",
        visualStyle: "rich"
    },
    flooded: {
        name: "Flooded Depths",
        description: "Slippery floors and rusted gates.",
        corridorWidth: 2,
        roomSizeBias: "standard",
        enemyDensity: 1.0,
        specialFeature: "water",
        visualStyle: "moss"
    }
};
