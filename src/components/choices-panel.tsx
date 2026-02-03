'use client';

import { useState } from 'react';

export default function ChoicesPanel() {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const choices = [
    { id: 1, text: 'VENTURE INTO THE GLOWING CORRIDOR (EAST)' },
    { id: 2, text: 'FORCE OPEN THE IRON DOOR (WEST)' },
    { id: 3, text: 'INVESTIGATE THE RUBBLE (NORTH)' },
  ];

  return (
    <div className="border-4 border-white p-6 bg-black">
      <h2 className="text-xl font-bold mb-4 text-white tracking-wider font-mono">
        CHOICES
      </h2>
      <div className="space-y-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => setSelectedChoice(choice.id)}
            className={`w-full text-left p-4 border-2 font-mono text-sm transition-all
              ${
                selectedChoice === choice.id
                  ? 'border-white bg-white text-black'
                  : 'border-white bg-black text-white hover:bg-white hover:text-black'
              }`}
          >
            [{choice.id}] {choice.text}
          </button>
        ))}
      </div>
      {selectedChoice && (
        <button className="w-full mt-4 p-3 border-4 border-white bg-white text-black font-mono font-bold tracking-wider hover:bg-black hover:text-white hover:border-white transition-all">
          CONFIRM CHOICE
        </button>
      )}
    </div>
  );
}
