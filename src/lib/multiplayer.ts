import usePartySocket from "partysocket/react";
import { useState, useEffect } from "react";

// Get the PartyKit host from environment or default to localhost
const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";

export type PartyMessage = {
    text: string;
    system?: boolean;
};

export function useMultiplayer(room: string = "default-room", username: string) {
    const [messages, setMessages] = useState<PartyMessage[]>([]);
    const [otherPlayers, setOtherPlayers] = useState<string[]>([]);

    const socket = usePartySocket({
        host: PARTYKIT_HOST,
        room: room,
        id: username, // identifying the connection
        onMessage(event) {
            const data = JSON.parse(event.data);
            console.log("PartyKit Message:", data);

            if (data.type === "system") {
                setMessages((prev) => [...prev, { text: data.text, system: true }]);
            }
        },
    });

    const broadcastAction = (action: string, payload: any) => {
        socket.send(JSON.stringify({
            type: "action",
            sender: username,
            action,
            payload
        }));
    };

    return {
        socket,
        messages,
        remotePlayers,
        broadcastAction
    };
}
