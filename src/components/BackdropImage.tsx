"use client";

import { motion } from "framer-motion";
import { z } from "zod";
import { getAssetPath } from "@/lib/assets";

type Props = {
    url?: string;
    alt: string;
};

export function BackdropImage({ url, alt }: Props) {
    // If no URL provided, try to resolve from our local asset registry based on the description (alt)
    let imageSrc = url || getAssetPath(alt);

    // console.log("BackdropImage rendering:", { alt, imageSrc });

    if (!imageSrc) return null;

    const isVideo = imageSrc.endsWith(".mp4") || imageSrc.endsWith(".webm");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0 pointer-events-none"
        >
            {isVideo ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover mix-blend-overlay"
                >
                    <source src={imageSrc} type="video/mp4" />
                </video>
            ) : (
                <img
                    src={imageSrc}
                    alt={alt}
                    className="w-full h-full object-cover mix-blend-overlay"
                />
            )}

            {/* Gradient overlay to ensure text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-[#050505]/80 to-transparent" />
        </motion.div>
    );
}

(BackdropImage as any).propsSchema = z.object({
    url: z.string().optional(),
    alt: z.string(),
});
