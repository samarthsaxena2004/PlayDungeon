import { StoryText } from "@/components/StoryText";
import { ChoiceButtons } from "@/components/ChoiceButtons";
import { PlayerStatus } from "@/components/PlayerStatus";
import { InventoryPanel } from "@/components/InventoryPanel";
import { DungeonCanvas } from "@/components/DungeonCanvas";
import { CombatHUD } from "@/components/CombatHUD";

// ─── ATTACH METADATA ───────────────────────────────

(StoryText as any).tambo = { name: "StoryText", description: "Display narrative text" };
(ChoiceButtons as any).tambo = { name: "ChoiceButtons", description: "Show choices for the user" };
(PlayerStatus as any).tambo = { name: "PlayerStatus", description: "Show player health and mana" };
(InventoryPanel as any).tambo = { name: "InventoryPanel", description: "Show inventory items" };
(DungeonCanvas as any).tambo = { name: "DungeonCanvas", description: "Visual representation of the dungeon" };
(CombatHUD as any).tambo = { name: "CombatHUD", description: "Combat interface" };


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
