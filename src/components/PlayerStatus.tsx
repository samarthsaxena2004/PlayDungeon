import PlayerStatusUI from "./player-status";
import { z } from "zod";

export const propsSchema = z.object({
  hp: z.number().optional(),
  mana: z.number().optional(),
});

export function PlayerStatus(props: z.infer<typeof propsSchema>) {
  return <PlayerStatusUI />;
}
