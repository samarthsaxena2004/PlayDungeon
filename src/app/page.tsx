import StoryPanel from "@/components/story-panel";
import ChoicesPanel from "@/components/choices-panel";
import PlayerStatus from "@/components/player-status";
import Inventory from "@/components/inventory";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono">

      <div className="border-4 border-white mb-8 p-6 bg-black">
        <h1 className="text-4xl md:text-5xl font-bold tracking-widest mb-2">
          PLAY
          <br />
          DUNGEON
        </h1>
        <p className="text-xs tracking-widest">
          :: NEO-BRUTALIST ADVENTURE ::
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <StoryPanel />
          <ChoicesPanel />
        </div>

        <div className="space-y-6">
          <PlayerStatus />
          <Inventory />
        </div>
      </div>

      <div className="border-4 border-white p-4">
        <p className="text-xs tracking-widest text-center">
          DUNGEON FLOOR 1 | LOCATION: UNKNOWN | TIME: 00:00
        </p>
      </div>

    </div>
  );
}
