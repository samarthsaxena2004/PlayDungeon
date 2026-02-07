"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, X, Sparkles } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  type: "weapon" | "armor" | "potion" | "scroll" | "key"
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  description: string
  quantity: number
}

const RARITY_COLORS = {
  common: "border-gray-600/40 text-gray-300",
  uncommon: "border-green-600/40 text-green-300",
  rare: "border-blue-600/40 text-blue-300",
  epic: "border-purple-600/40 text-purple-300",
  legendary: "border-amber-500/40 text-amber-300",
}

const RARITY_BG = {
  common: "bg-gray-900/20",
  uncommon: "bg-green-900/20",
  rare: "bg-blue-900/20",
  epic: "bg-purple-900/20",
  legendary: "bg-amber-900/20",
}

const TYPE_EMOJI: Record<string, string> = {
  weapon: "W",
  armor: "A",
  potion: "P",
  scroll: "S",
  key: "K",
}

const DEMO_ITEMS: InventoryItem[] = [
  { id: "i1", name: "Iron Sword", type: "weapon", rarity: "common", description: "+5 ATK", quantity: 1 },
  { id: "i2", name: "Health Potion", type: "potion", rarity: "common", description: "+25 HP", quantity: 3 },
  { id: "i3", name: "Arcane Shield", type: "armor", rarity: "rare", description: "+15 DEF, +5 Magic Resist", quantity: 1 },
  { id: "i4", name: "Fire Scroll", type: "scroll", rarity: "epic", description: "AoE 40 DMG, 3x3 area", quantity: 1 },
  { id: "i5", name: "Boss Key", type: "key", rarity: "legendary", description: "Opens the Boss Chamber", quantity: 1 },
  { id: "i6", name: "Mana Potion", type: "potion", rarity: "uncommon", description: "+15 MP", quantity: 2 },
]

export function InventoryPanel({ onClose }: { onClose: () => void }) {
  const [items] = useState<InventoryItem[]>(DEMO_ITEMS)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md mx-4 bg-[hsl(220,15%,7%)] border border-[hsl(var(--border))] rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(220,15%,9%)]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="font-pixel text-xs text-[hsl(var(--foreground))]">INVENTORY</span>
            <span className="font-pixel text-[9px] text-[hsl(var(--muted-foreground))]">
              ({items.length}/20)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-[hsl(220,15%,15%)] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Item Grid */}
        <div className="p-3 grid grid-cols-4 gap-2">
          {items.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              className={`relative flex flex-col items-center gap-1 p-2 rounded border transition-all ${
                selectedItem?.id === item.id
                  ? `${RARITY_BG[item.rarity]} ${RARITY_COLORS[item.rarity]} ring-1 ring-current`
                  : `bg-[hsl(220,15%,10%)] border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]`
              }`}
            >
              <span className={`font-pixel text-sm ${RARITY_COLORS[item.rarity].split(" ")[1]}`}>
                {TYPE_EMOJI[item.type]}
              </span>
              <span className="font-pixel text-[7px] text-center leading-tight text-[hsl(var(--foreground))]">
                {item.name}
              </span>
              {item.quantity > 1 && (
                <span className="absolute top-0.5 right-0.5 font-pixel text-[7px] text-[hsl(var(--muted-foreground))] bg-[hsl(220,15%,15%)] rounded px-0.5">
                  x{item.quantity}
                </span>
              )}
            </motion.button>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center p-2 rounded border border-dashed border-[hsl(var(--border))] bg-[hsl(220,15%,6%)] min-h-[60px]"
            >
              <span className="text-[9px] text-[hsl(var(--border))]">Empty</span>
            </div>
          ))}
        </div>

        {/* Item detail */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[hsl(var(--border))]"
            >
              <div className="p-3 flex items-start justify-between">
                <div>
                  <p className={`font-pixel text-xs ${RARITY_COLORS[selectedItem.rarity].split(" ")[1]}`}>
                    {selectedItem.name}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 capitalize">
                    {selectedItem.rarity} {selectedItem.type}
                  </p>
                  <p className="text-[11px] text-[hsl(var(--foreground))] mt-1">
                    {selectedItem.description}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="px-2 py-1 rounded text-[9px] font-pixel bg-emerald-900/30 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/50 transition-colors"
                  >
                    USE
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded text-[9px] font-pixel bg-red-900/20 border border-red-800/30 text-red-400 hover:bg-red-900/40 transition-colors"
                  >
                    DROP
                  </button>
                </div>
              </div>
              {/* Tambo insight */}
              <div className="mx-3 mb-3 p-2 rounded bg-orange-900/10 border border-orange-800/20">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                  <span className="text-[8px] text-orange-400 font-mono">Tambo AI Insight</span>
                </div>
                <p className="text-[10px] text-orange-200/70 leading-relaxed">
                  {selectedItem.type === "weapon"
                    ? "Effective against undead enemies on this floor. Consider upgrading at the merchant."
                    : selectedItem.type === "potion"
                      ? "Save this for the boss fight ahead. Your health pattern suggests you'll need it."
                      : selectedItem.type === "key"
                        ? "The boss chamber is to the southeast. Proceed with caution."
                        : "This item synergizes well with your current build."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
