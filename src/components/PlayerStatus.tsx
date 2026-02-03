import PlayerStatusUI from "./player-status";
import { z } from "zod";

export function PlayerStatus(props: any) {
  return <PlayerStatusUI />;
}

PlayerStatus.propsSchema = z.object({
  hp: z.number().optional(),
  mana: z.number().optional(),
});
