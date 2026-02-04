import { z } from "zod";

export function DeathScreen(props: {
  reason: string;
}) {
  return (
    <div className="border-4 border-red-700 p-6 text-center">
      <div className="text-red-500 text-lg mb-2">
        YOU DIED
      </div>

      <div className="text-xs mb-4 opacity-80">
        {props.reason}
      </div>

      <button
        data-tambo-action="restart"
        className="border-2 border-white p-3"
      >
        BEGIN AGAIN
      </button>
    </div>
  );
}

DeathScreen.propsSchema = z.object({
  reason: z.string(),
});
