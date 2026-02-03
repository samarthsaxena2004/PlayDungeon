export default function PlayerStatus() {
  const stats = {
    hp: 45,
    maxHp: 60,
    mana: 20,
    maxMana: 30,
    level: 3,
    experience: 1250,
    gold: 450,
  };

  const hpPercent = (stats.hp / stats.maxHp) * 100;
  const manaPercent = (stats.mana / stats.maxMana) * 100;

  return (
    <div className="border-4 border-white p-4 bg-black text-white font-mono space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-wider mb-3">PLAYER</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between mb-1">
            <span>LEVEL {stats.level}</span>
            <span>EXP: {stats.experience}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1 tracking-wider">
            <span>HP</span>
            <span>
              {stats.hp}/{stats.maxHp}
            </span>
          </div>
          <div className="border-2 border-white h-3 bg-black">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1 tracking-wider">
            <span>MANA</span>
            <span>
              {stats.mana}/{stats.maxMana}
            </span>
          </div>
          <div className="border-2 border-white h-3 bg-black">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${manaPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-t-2 border-white pt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>GOLD:</span>
          <span className="font-bold">{stats.gold}</span>
        </div>
      </div>
    </div>
  );
}
