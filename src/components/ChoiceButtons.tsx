import { z } from "zod";

export function ChoiceButtons(props: {
  choices: { id: string; text: string }[];
}) {
  return (
    <div className="space-y-2">
      {props.choices.map((c) => (
        <button
          key={c.id}
          data-tambo-action={c.id}
          className="w-full border-2 border-white p-3 hover:bg-white hover:text-black"
        >
          {c.text}
        </button>
      ))}
    </div>
  );
}

ChoiceButtons.propsSchema = z.object({
  choices: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
});
