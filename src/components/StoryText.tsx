import StoryPanel from "./story-panel";
import { z } from "zod";

export const propsSchema = z.object({
  text: z.string().optional(),
});

export function StoryText(props: z.infer<typeof propsSchema>) {
  return <StoryPanel />;
}
