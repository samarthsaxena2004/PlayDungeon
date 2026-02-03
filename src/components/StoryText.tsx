import { z } from "zod";

export function StoryText(props: { text: string }) {
  return (
    <div className="border-4 border-white p-6 bg-black">
      <pre className="whitespace-pre-wrap font-mono">
        {props.text}
      </pre>
    </div>
  );
}

StoryText.propsSchema = z.object({
  text: z.string(),
});
