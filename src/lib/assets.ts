export const ASSETS = {
    // Deep Dungeon
    dungeon: {
        hallway: "/games/dungeon/backgrounds/hallway.jpg",
        crypt: "/games/dungeon/backgrounds/crypt.jpg",
        boss: "/games/dungeon/backgrounds/boss.jpg",

        // Characters
        hero_idle: "/games/dungeon/characters/hero_idle.jpg",
        goblin: "/games/dungeon/characters/goblin.jpg",
    },

    // Neural Maze
    maze: {
        grid: "/games/maze/backgrounds/grid.mp4",
    },

    // Cyber Pigeon
    pigeon: {
        city: "/games/pigeon/backgrounds/city.jpg",
    },

    // Shadow Piggy
    piggy: {
        house: "/games/piggy/backgrounds/haunted_house.jpg",
    }
};

export function getAssetPath(key: string) {
    const k = key.toLowerCase();

    // Rule-based matching
    if (k.includes("hallway") || k.includes("corridor") || k.includes("entrance")) return ASSETS.dungeon.hallway;
    if (k.includes("crypt") || k.includes("grave")) return ASSETS.dungeon.crypt;
    if (k.includes("boss") || k.includes("throne")) return ASSETS.dungeon.boss;

    if (k.includes("maze") || k.includes("grid")) return ASSETS.maze.grid;
    if (k.includes("city") || k.includes("skyline")) return ASSETS.pigeon.city;
    if (k.includes("house") || k.includes("piggy") || k.includes("haunted")) return ASSETS.piggy.house;

    // Fallback map
    if (k.includes("dungeon")) return ASSETS.dungeon.hallway;

    return null;
}
