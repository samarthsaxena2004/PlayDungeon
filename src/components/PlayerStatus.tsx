import { z } from "zod";

export function PlayerStatus(props: {
  hp: number;
  mana: number;
  location: string;
  inventory: string[];
}) {
  return (
    <div className="border-4 border-white p-4 bg-black text-white font-mono">
      <h2 className="text-lg mb-2">PLAYER</h2>

      <div>HP: {props.hp}</div>
      <div>Mana: {props.mana}</div>
      <div>Location: {props.location}</div>

      <div className="mt-2">
        Inventory: {props.inventory?.join(", ") || "Empty"}
      </div>
    </div>
  );
}

PlayerStatus.propsSchema = z.object({
  hp: z.number(),
  mana: z.number(),
  location: z.string(),
  inventory: z.array(z.string()),
});
