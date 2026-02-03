import Inventory from "./inventory";
import { z } from "zod";

export const propsSchema = z.object({
  items: z.array(z.string()).optional(),
});

export function InventoryPanel(props: z.infer<typeof propsSchema>) {
  return <Inventory />;
}
