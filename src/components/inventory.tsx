'use client';

import { useState } from 'react';

export default function Inventory() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const items = [
    { id: 1, name: 'IRON SWORD', quantity: 1, slot: '[EQUIP]' },
    { id: 2, name: 'LEATHER ARMOR', quantity: 1, slot: '[EQUIP]' },
    { id: 3, name: 'HEALTH POTION', quantity: 3, slot: '' },
    { id: 4, name: 'MANA POTION', quantity: 2, slot: '' },
    { id: 5, name: 'ANCIENT KEY', quantity: 1, slot: '' },
    { id: 6, name: 'ROPE (50FT)', quantity: 1, slot: '' },
  ];

  return (
    <div className="border-4 border-white p-4 bg-black text-white font-mono">
      <h2 className="text-lg font-bold tracking-wider mb-3">INVENTORY</h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item.id)}
            className={`w-full text-left p-2 border-2 text-xs transition-all
              ${
                selectedItem === item.id
                  ? 'border-white bg-white text-black'
                  : 'border-white bg-black text-white hover:border-white'
              }`}
          >
            <div className="flex justify-between items-center">
              <span className="flex-1">{item.name}</span>
              <span className="ml-2">{item.slot}</span>
              {item.quantity > 1 && <span className="ml-2">x{item.quantity}</span>}
            </div>
          </button>
        ))}
      </div>

      {selectedItem && (
        <div className="mt-3 pt-3 border-t-2 border-white text-xs space-y-2">
          <p className="text-white">
            <span className="font-bold">SELECTED:</span> {items[selectedItem - 1]?.name}
          </p>
          <div className="flex gap-2">
            <button className="flex-1 p-2 border-2 border-white hover:bg-white hover:text-black transition-all">
              USE
            </button>
            <button className="flex-1 p-2 border-2 border-white hover:bg-white hover:text-black transition-all">
              DROP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
