"use client";

import { motion } from "framer-motion";
import { z } from "zod";

type Props = {
    url?: string;
    alt: string;
};

export function BackdropImage({ url, alt }: Props) {
    // If no URL provided, we might fallback or just show a colored overlay
    // for now, we assume the AI might send a placeholder or we map keywords to local files
    let imageSrc = url;

    // Quick mapping for demo purposes if the AI just sends keywords
    if (!url) {
        if (alt.toLowerCase().includes("maze")) imageSrc = "/maze_bg.webp";
        else if (alt.toLowerCase().includes("dungeon")) imageSrc = "/dungeon_bg.webp";
        else if (alt.toLowerCase().includes("city")) imageSrc = "/city_bg.webp";
    }

    if (!imageSrc) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0 pointer-events-none"
        >
            <img
                src={imageSrc}
                alt={alt}
                className="w-full h-full object-cover mix-blend-overlay"
            />
            {/* Gradient overlay to ensure text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-[#050505]/80 to-transparent" />
        </motion.div>
    );
}

(BackdropImage as any).propsSchema = z.object({
    url: z.string().optional(),
    alt: z.string(),
});
