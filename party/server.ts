import type * as Party from "partykit/server";

export default class DeepDungeonServer implements Party.Server {
    constructor(readonly room: Party.Room) { }

    onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        console.log(`Connected: ${conn.id} from ${ctx.request.url}`);

        // Broadcast welcome message to everyone including the new connection
        this.room.broadcast(JSON.stringify({
            type: "system",
            text: `Player ${conn.id} joined the dungeon`
        }));
    }

    onMessage(message: string, sender: Party.Connection) {
        // Simple echo broadcast for now
        // In the future, this will handle game state updates
        this.room.broadcast(message, [sender.id]);
    }
}

DeepDungeonServer satisfies Party.Worker;
