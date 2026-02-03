export function PlayerStatus() {
  return (
    <div className="border-2 border-white p-3">
      <h3 className="mb-2">Status</h3>

      <div className="text-sm space-y-1">
        <div>Health: 85/100</div>
        <div>Mana: 60/80</div>
        <div>Armor: 15</div>
      </div>
    </div>
  );
}
