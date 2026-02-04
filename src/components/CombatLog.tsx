import { z } from "zod";

export function CombatLog(props: {
  lines: string[];
}) {
  return (
    <div className="border-2 border-white p-3 text-xs bg-black">
      <div className="opacity-70 mb-1">COMBAT LOG</div>
      {props.lines.slice(-4).map((l, i) => (
        <div key={i}>› {l}</div>
      ))}
    </div>
  );
}

CombatLog.propsSchema = z.object({
  lines: z.array(z.string()),
});
