import { z } from "zod";

export function CombatHUD(props: {
  enemy?: string;
  danger: number;
}) {
  if (!props.enemy) return null;

  return (
    <div className="border-2 border-red-600 p-2 text-xs animate-pulse">
      <div>⚔ ENEMY: {props.enemy}</div>
      <div>DANGER: {props.danger}%</div>
    </div>
  );
}

CombatHUD.propsSchema = z.object({
  enemy: z.string().optional(),
  danger: z.number(),
});
