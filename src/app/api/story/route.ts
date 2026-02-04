import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { dungeonHandler } from "@/lib/games/dungeon";
import { mazeHandler } from "@/lib/games/maze";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { gameId, action, state } = await req.json();

  try {
    let responseData;

    switch (gameId) {
      case 'dungeon':
        responseData = await dungeonHandler(client, action, state);
        break;
      case 'maze':
        responseData = await mazeHandler(client, action, state);
        break;
      default:
        // Fallback or Error
        return Response.json({ narrative: "Game cartridge blown. Re-insert." }, { status: 400 });
    }

    return Response.json(responseData);

  } catch (err) {
    console.error("API ERROR:", err);
    return Response.json({
      narrative: "SYSTEM FAILURE. The console sparks and smokes...",
      ui: [
        { component: "DungeonCanvas", props: { location: "FATAL ERROR" } },
        { component: "ChoiceButtons", props: { choices: [{ id: "retry", text: "Reboot System" }] } }
      ],
      state: state,
    }, { status: 500 });
  }
}
