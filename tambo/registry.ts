import { createRegistry } from "@tambo-ai/react";

import { StoryText } from "@/components/StoryText";
import { ChoiceButtons } from "@/components/ChoiceButtons";
import { PlayerStatus } from "@/components/PlayerStatus";
import { InventoryPanel } from "@/components/InventoryPanel";

export const registry = createRegistry({
  StoryText,
  ChoiceButtons,
  PlayerStatus,
  InventoryPanel,
});
