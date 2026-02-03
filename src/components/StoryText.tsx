import StoryPanel from "./story-panel";
import { z } from "zod";

export function StoryText(props: { text?: string }) {
  return <StoryPanel />;
}

StoryText.propsSchema = z.object({
  text: z.string().optional(),
});
