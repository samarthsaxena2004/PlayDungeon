import { z } from "zod";

export function DungeonCanvas(props: {
  location: string;
}) {
  return (
    <div className="border-4 border-white h-[260px] flex items-center justify-center">
      <span className="opacity-60">
        [ DUNGEON: {props.location} ]
      </span>
    </div>
  );
}

DungeonCanvas.propsSchema = z.object({
  location: z.string(),
});
