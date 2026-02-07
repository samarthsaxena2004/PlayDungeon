import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Particle() {
    const [style, setStyle] = useState<{ left: string; top: string; duration: number; delay: number } | null>(null);

    useEffect(() => {
        setStyle({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
        });
    }, []);

    if (!style) return null;

    return (
        <motion.div
            className="absolute w-0.5 h-0.5 rounded-full bg-orange-400/30"
            style={{ left: style.left, top: style.top }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
            transition={{
                duration: style.duration,
                delay: style.delay,
                repeat: Infinity,
            }}
        />
    );
}
