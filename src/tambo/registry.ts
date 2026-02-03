import { createTambo } from "@tambo-ai/react";

import { StoryText } from "@/components/StoryText";
import { ChoiceButtons } from "@/components/ChoiceButtons";
import { PlayerStatus } from "@/components/PlayerStatus";
import { InventoryPanel } from "@/components/InventoryPanel";

export const tambo = createTambo({
  components: {
    StoryText,
    ChoiceButtons,
    PlayerStatus,
    InventoryPanel,
  },
});
