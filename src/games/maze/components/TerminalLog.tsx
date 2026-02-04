
import { useEffect, useRef } from "react";
import { Message } from "@/game/store";

export function TerminalLog({ messages }: { messages: Message[] }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 min-h-[200px] overflow-y-auto p-4 font-mono text-sm bg-black/80 text-green-400 border border-green-900 rounded-lg shadow-inner">
            {messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                    <span className="opacity-50 mr-2">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                    <span className={msg.role === 'user' ? 'text-white font-bold' : 'text-green-400'}>
                        {msg.role === 'user' ? '>' : '#'} {msg.content}
                    </span>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
