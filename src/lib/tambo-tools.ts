export const TAMBO_TOOLS = [
    {
        type: "function",
        function: {
            name: "spawn_entity",
            description: "Spawn a new entity in the game world, such as an enemy or NPC.",
            parameters: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        enum: ["slime", "skeleton", "ghost", "boss", "merchant", "villager"],
                        description: "The type of entity to spawn."
                    },
                    position: {
                        type: "object",
                        properties: {
                            x: { type: "number", description: "X coordinate (grid)" },
                            y: { type: "number", description: "Y coordinate (grid)" }
                        },
                        description: "Position to spawn the entity. If omitted, spawns near player."
                    },
                    personality: {
                        type: "string",
                        description: "A brief description of the entity's behavior or mood."
                    }
                },
                required: ["type", "personality"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "modify_room",
            description: "Apply an environmental effect to the current room.",
            parameters: {
                type: "object",
                properties: {
                    effect: {
                        type: "string",
                        enum: ["darkness", "fog", "fire", "healing_aura", "quake"],
                        description: "The environmental effect to apply."
                    },
                    intensity: {
                        type: "number",
                        minimum: 1,
                        maximum: 10,
                        description: "Intensity of the effect (1-10)."
                    }
                },
                required: ["effect", "intensity"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "combat_decision",
            description: "Make a strategic decision for an enemy during combat.",
            parameters: {
                type: "object",
                properties: {
                    enemyId: {
                        type: "string",
                        description: "ID of the enemy making the decision."
                    },
                    tactic: {
                        type: "string",
                        enum: ["aggressive", "defensive", "flank", "flee", "cast_spell"],
                        description: "The trusted combat tactic."
                    }
                },
                required: ["enemyId", "tactic"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "grant_loot",
            description: "Give an item or reward to the player.",
            parameters: {
                type: "object",
                properties: {
                    rarity: {
                        type: "string",
                        enum: ["common", "rare", "epic", "legendary"],
                        description: "Rarity of the loot."
                    },
                    itemType: {
                        type: "string",
                        enum: ["weapon", "potion", "scroll", "key", "gold"],
                        description: "Type of item granted."
                    }
                },
                required: ["rarity", "itemType"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "social_interaction",
            description: "Handle a social interaction result.",
            parameters: {
                type: "object",
                properties: {
                    target: {
                        type: "string",
                        description: "Name or ID of the NPC target."
                    },
                    intent: {
                        type: "string",
                        enum: ["friendly", "hostile", "persuade", "intimidate", "trade"],
                        description: "The player's intent or the result of the interaction."
                    },
                    success: {
                        type: "boolean",
                        description: "Whether the social move succeeded."
                    }
                },
                required: ["target", "intent"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "trigger_event",
            description: "Trigger a scripted game event.",
            parameters: {
                type: "object",
                properties: {
                    eventId: {
                        type: "string",
                        description: "Unique identifier for the event."
                    },
                    description: {
                        type: "string",
                        description: "Narrative description of the event."
                    }
                },
                required: ["eventId", "description"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "spawn_custom_entity",
            description: "Invent and spawn a brand new enemy type or NPC.",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Name of the entity (e.g. 'Void Rat')" },
                    description: { type: "string", description: "Visual description" },
                    stats: {
                        type: "object",
                        properties: {
                            health: { type: "number" },
                            damage: { type: "number" },
                            speed: { type: "number", description: "Speed multiplier (0.5 - 1.5)" }
                        },
                        required: ["health", "damage", "speed"]
                    }
                },
                required: ["name", "description", "stats"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_quest",
            description: "Create a new dynamic quest for the player.",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    target_count: { type: "number", description: "Number of things to kill/collect" },
                    reward_gold: { type: "number" }
                },
                required: ["title", "description", "target_count", "reward_gold"]
            }
        }
    }
];

export type ClientToolCall = {
    name: string;
    arguments: any;
};
