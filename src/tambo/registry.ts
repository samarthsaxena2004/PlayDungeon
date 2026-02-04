import { StoryText } from "@/components/StoryText";
import { ChoiceButtons } from "@/components/ChoiceButtons";
import { PlayerStatus } from "@/components/PlayerStatus";
import { InventoryPanel } from "@/components/InventoryPanel";
import { DungeonCanvas } from "@/components/DungeonCanvas";
import { CombatHUD } from "@/components/CombatHUD";

// Force stable names
(StoryText as any).name = "StoryText";
(ChoiceButtons as any).name = "ChoiceButtons";
(PlayerStatus as any).name = "PlayerStatus";
(InventoryPanel as any).name = "InventoryPanel";
(DungeonCanvas as any).name = "DungeonCanvas";
(CombatHUD as any).name = "CombatHUD";

export const tamboComponents = [
  StoryText,
  ChoiceButtons,
  PlayerStatus,
  InventoryPanel,
  DungeonCanvas,
  CombatHUD,
];
