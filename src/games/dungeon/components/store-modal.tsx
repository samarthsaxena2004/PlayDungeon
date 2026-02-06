'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, X, ShoppingBag, Zap, Heart, Sword, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ShopkeeperData } from '@/games/dungeon/hooks/use-shopkeeper';

export type StoreItem = {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'speed' | 'damage' | 'heal';
    value: number;
    duration?: number;
    icon: React.ReactNode;
};

const ITEMS: StoreItem[] = [
    {
        id: 'health-potion',
        name: 'Health Potion',
        description: 'Restores 50 HP immediately.',
        cost: 30,
        type: 'heal',
        value: 50,
        icon: <Heart className="text-red-500" />,
    },
    {
        id: 'speed-elixir',
        name: 'Velocity Vile',
        description: '+50% Movement Speed for 30s.',
        cost: 50,
        type: 'speed',
        value: 1.5,
        duration: 30000,
        icon: <Zap className="text-yellow-400" />,
    },
    {
        id: 'power-brew',
        name: 'Titan\'s Brew',
        description: 'Double damage for 30s.',
        cost: 100,
        type: 'damage',
        value: 2,
        duration: 30000,
        icon: <Sword className="text-orange-500" />,
    },
];

interface StoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    coins: number;
    onPurchase: (item: StoreItem) => void;
}

export function StoreModal({ isOpen, onClose, coins, onPurchase }: StoreModalProps) {
    const [activeTab, setActiveTab] = useState<'items'>('items');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Dungeon Shop</h2>
                                <p className="text-xs text-muted-foreground">"Best wares in the dark!"</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-yellow-900/40 px-3 py-1.5 rounded-full border border-yellow-700/50">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="font-mono font-bold text-yellow-100">{coins}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/80">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ITEMS.map((item) => {
                                const canAfford = coins >= item.cost;
                                return (
                                    <div
                                        key={item.id}
                                        className={`
                      relative group border rounded-lg p-4 transition-all
                      ${canAfford ? 'border-border bg-card hover:border-primary/50' : 'border-border/30 bg-muted/20 opacity-70'}
                    `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800 group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-sm">
                                                <span className={canAfford ? 'text-yellow-400' : 'text-red-400'}>{item.cost}</span>
                                                <Coins className="w-3 h-3 text-yellow-500" />
                                            </div>
                                        </div>

                                        <h3 className="font-bold mb-1">{item.name}</h3>
                                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                            {item.description}
                                        </p>

                                        <Button
                                            className="w-full"
                                            variant={canAfford ? 'secondary' : 'outline'}
                                            disabled={!canAfford}
                                            onClick={() => onPurchase(item)}
                                        >
                                            {canAfford ? 'Purchase' : 'Not enough coins'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer / Shopkeeper Area */}
                    <div className="p-4 border-t border-border bg-zinc-900/80 text-center text-sm text-muted-foreground italic">
                        "Come active those reflexes, hero! You'll need them for level 5."
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
