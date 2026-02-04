import { useEffect } from "react";
import { useGameStore } from "@/game/store";

export function useInputManager(onAction: (action: string) => void) {
    const { activeGame, isThinking } = useGameStore();

    useEffect(() => {
        if (!activeGame || isThinking) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;

            const key = e.key.toLowerCase();

            let action = "";

            // ─── 1. GLOBAL MOVEMENT (WASD / ARROWS) ───
            if (key === "w" || key === "arrowup") action = "north"; // Default directional
            if (key === "s" || key === "arrowdown") action = "south";
            if (key === "a" || key === "arrowleft") action = "west";
            if (key === "d" || key === "arrowright") action = "east";

            // ─── 2. GAME SPECIFIC OVERRIDES ───
            switch (activeGame) {
                case "maze":
                    // Maze uses standard directions, mapped above
                    break;

                case "pigeon":
                    if (key === " " || key === "w" || key === "arrowup") action = "flap"; // Space/Up to flap
                    if (key === "s" || key === "arrowdown") action = "dive";
                    break;

                case "piggy":
                    if (key === "h") action = "hide";
                    if (key === "r") action = "run";
                    // WASD could also be used for specific moves if we expand logic
                    break;
            }

            if (action) {
                e.preventDefault();
                onAction(action);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeGame, isThinking, onAction]);
}
