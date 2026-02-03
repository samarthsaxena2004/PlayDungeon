import ChoicesPanel from "./choices-panel";
import { z } from "zod";

export const propsSchema = z.object({
  choices: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
});

export function ChoiceButtons(props: z.infer<typeof propsSchema>) {
  return <ChoicesPanel />;
}
