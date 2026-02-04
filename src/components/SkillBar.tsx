import { z } from "zod";

export function SkillBar(props: {
  mana: number;
}) {
  const skills = [
    { id: "strike", text: "Strike (0)" },
    { id: "focus", text: "Focus (0)" },
    { id: "spark", text: "Spark (10)" },
    { id: "ward", text: "Ward (12)" },
  ];

  return (
    <div className="border-2 border-white p-2">
      <div className="text-xs opacity-70 mb-1">
        SKILLS — Mana: {props.mana}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {skills.map(s => (
          <button
            key={s.id}
            data-tambo-action={s.id}
            className="border p-2 text-xs hover:bg-white hover:text-black"
          >
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}

SkillBar.propsSchema = z.object({
  mana: z.number(),
});
