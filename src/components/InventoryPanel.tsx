import { z } from "zod";

export function InventoryPanel(props: {
  items: string[];
}) {
  return (
    <div className="border-4 border-white p-4 bg-black text-white font-mono">
      <h2 className="text-lg font-bold tracking-wider mb-3">
        INVENTORY
      </h2>

      <div className="space-y-2">
        {props.items?.length ? (
          props.items.map((item, i) => (
            <div
              key={i}
              className="border-2 border-white p-2 text-xs"
            >
              {item}
            </div>
          ))
        ) : (
          <div className="opacity-60 text-xs">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

InventoryPanel.propsSchema = z.object({
  items: z.array(z.string()),
});
