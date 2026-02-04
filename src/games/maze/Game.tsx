
import { useEffect } from "react";
import { useGameStore } from "@/game/store";
import { MazeView } from "./components/MazeView";
import { TerminalLog } from "./components/TerminalLog";
import { NavControls } from "./components/NavControls";
import { useInputManager } from "@/game/useInputManager";
import { SystemMenu } from "@/components/SystemMenu";

export default function NeuralMazeGame() {
    const {
        messages, meta, activeGame, updateStats, updateMeta,
        setThinking, addMessage, setActiveGame
    } = useGameStore();

    // Init
    useEffect(() => {
        if (messages.length === 0 || messages[0].content.includes("Deep Dungeon")) {
            useGameStore.setState({
                messages: [{
                    id: 'init-maze',
                    role: 'assistant',
                    content: "CONNECTION ESTABLISHED. SYSTEM: NEURAL MAZE V1.0. LOCATING USER...",
                    timestamp: Date.now()
                }]
            });
        }
    }, []);

    async function handleAction(action: string) {
        if (action === "EXIT") {
            setActiveGame(null);
            return;
        }

        setThinking(true);
        addMessage({ role: "user", content: action });

        try {
            const currentState = useGameStore.getState();
            const res = await fetch("/api/story", {
                method: "POST",
                body: JSON.stringify({
                    gameId: 'maze',
                    action,
                    state: {
                        stats: currentState.stats,
                        inventory: currentState.inventory,
                        meta: currentState.meta
                    }
                }),
            });

            if (!res.ok) throw new Error("API Failed");
            const data = await res.json();

            if (data.narrative) addMessage({ role: "assistant", content: data.narrative });

            // Maze mostly updates meta (location, danger)
            if (data.meta) updateMeta(data.meta);

        } catch (err) {
            console.error(err);
            addMessage({ role: "system", content: "ERR_CONNECTION_RESET" });
        } finally {
            setThinking(false);
        }
    }

    useInputManager(handleAction);

    return (
        <div className="h-screen w-full bg-black text-green-500 font-mono flex flex-col overflow-hidden relative">

            {/* 3D Viewport */}
            <div className="flex-1 relative">
                <MazeView danger={meta.dangerLevel} />

                {/* Overlay Location */}
                <div className="absolute top-4 left-4 bg-black/50 p-2 border border-green-900 rounded">
                    <div>LOC: {meta.location || "UNKNOWN SECTOR"}</div>
                    <div>DANGER: {meta.dangerLevel}%</div>
                </div>
            </div>

            {/* Terminal Output */}
            <div className="h-1/3 flex flex-col border-t-2 border-green-900 bg-black">
                <TerminalLog messages={messages} />
                <NavControls onAction={handleAction} />
            </div>

            <SystemMenu
                isChatOpen={false}
                onToggleChat={() => { }}
                onExit={() => setActiveGame(null)}
            />

            {/* CRT Effect Overlay */}
            <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[size:100%_2px,3px_100%] opacity-20" />
        </div>
    );
}
