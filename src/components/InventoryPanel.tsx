import Inventory from "./inventory";
import { z } from "zod";

export function InventoryPanel(props: any) {
  return <Inventory />;
}

InventoryPanel.propsSchema = z.object({
  items: z.array(z.string()).optional(),
});
