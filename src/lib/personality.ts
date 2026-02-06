export interface PlayerProfile {
    cruelty: number; // 0.0 (Saint) to 1.0 (Tyrant)
    tactics: 'aggressive' | 'stealthy' | 'diplomatic' | 'balanced';
    playstyle: 'explorer' | 'speedrunner' | 'collector';
    actions: {
        kills: number;
        spares: number; // Encounters resolved without killing
        lootCount: number;
        roomsVisited: number;
        conversations: number;
    };
}

export const INITIAL_PROFILE: PlayerProfile = {
    cruelty: 0.5,
    tactics: 'balanced',
    playstyle: 'explorer',
    actions: {
        kills: 0,
        spares: 0,
        lootCount: 0,
        roomsVisited: 0,
        conversations: 0,
    },
};

export function updateProfile(current: PlayerProfile, event: { type: string; value?: number }): PlayerProfile {
    const next = { ...current, actions: { ...current.actions } };

    switch (event.type) {
        case 'kill':
            next.actions.kills++;
            // Killing increases cruelty slightly
            next.cruelty = Math.min(1.0, next.cruelty + 0.05);
            break;

        case 'spare':
        case 'flee':
            next.actions.spares++;
            // Mercy decreases cruelty
            next.cruelty = Math.max(0.0, next.cruelty - 0.05);
            break;

        case 'loot':
            next.actions.lootCount++;
            break;

        case 'explore':
            next.actions.roomsVisited++;
            break;

        case 'talk':
            next.actions.conversations++;
            // Talking decreases cruelty
            next.cruelty = Math.max(0.0, next.cruelty - 0.02);
            break;
    }

    // derive detailed traits
    if (next.actions.kills > next.actions.spares * 2) {
        next.tactics = 'aggressive';
    } else if (next.actions.spares > next.actions.kills) {
        next.tactics = 'diplomatic'; // or evasive
    } else {
        next.tactics = 'balanced';
    }

    // simpler heuristic for playstyle
    // speedrunner if high kills/rooms ratio? or just low time? (we don't track time yet)
    // collector if high loot
    if (next.actions.lootCount > next.actions.roomsVisited * 1.5) {
        next.playstyle = 'collector';
    } else {
        next.playstyle = 'explorer';
    }

    return next;
}

export function getPersonalitySystemPrompt(profile: PlayerProfile): string {
    const crueltyLevel = profile.cruelty > 0.7 ? "Cruel" : profile.cruelty < 0.3 ? "Merciful" : "Balanced";

    return `
    Player Profile:
    - Nature: ${crueltyLevel} (Score: ${profile.cruelty.toFixed(2)})
    - Tactics: ${profile.tactics.toUpperCase()}
    - Playstyle: ${profile.playstyle.toUpperCase()}
    
    ADAPTATION INSTRUCTIONS:
    ${profile.tactics === 'aggressive' ? '- The player is violent. Offer more combat challenges or guilt-trip them about the slaughter.' : ''}
    ${profile.tactics === 'diplomatic' ? '- The player prefers peace. Offer puzzle solutions or social encounters instead of just fights.' : ''}
    ${profile.playstyle === 'collector' ? '- The player loves loot. Tempt them with cursed treasures.' : ''}
    ${profile.cruelty > 0.8 ? '- The dungeon reacts to their bloodlust. Make enemies terrified or vengeful.' : ''}
  `;
}
