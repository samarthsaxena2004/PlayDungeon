import ChoicesPanel from "./choices-panel";
import { z } from "zod";

export function ChoiceButtons(props: any) {
  return <ChoicesPanel />;
}

ChoiceButtons.propsSchema = z.object({
  choices: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
});
