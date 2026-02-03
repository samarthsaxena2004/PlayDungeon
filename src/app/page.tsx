import { StoryText } from "@/components/StoryText";
import { ChoiceButtons } from "@/components/ChoiceButtons";
import { PlayerStatus } from "@/components/PlayerStatus";
import { InventoryPanel } from "@/components/InventoryPanel";

export default function Home() {
  return (
    <main className="p-6 grid gap-4">
      
      <StoryText />

      <div className="grid grid-cols-2 gap-4">
        <PlayerStatus />
        <InventoryPanel />
      </div>

      <ChoiceButtons />

    </main>
  );
}
