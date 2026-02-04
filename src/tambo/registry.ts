import { StoryText } from "@/components/StoryText";
import { ChoiceButtons } from "@/components/ChoiceButtons";
import { PlayerStatus } from "@/components/PlayerStatus";
import { InventoryPanel } from "@/components/InventoryPanel";
import { DungeonCanvas } from "@/components/DungeonCanvas";
import { CombatHUD } from "@/components/CombatHUD";

// ─── EXPLICIT MAP (NO .name HACK) ─────────────────────

export const tamboComponentMap: Record<string, any> = {
  DungeonCanvas,
  StoryText,
  ChoiceButtons,
  PlayerStatus,
  InventoryPanel,
  CombatHUD,
};

// Legacy array still used by provider
export const tamboComponents = [
  StoryText,
  ChoiceButtons,
  PlayerStatus,
  InventoryPanel,
  DungeonCanvas,
  CombatHUD,
];
