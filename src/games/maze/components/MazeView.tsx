
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function MazeView({ danger = 0 }: { danger?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let frame = 0;

        // Resize handler
        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || 640;
            canvas.height = canvas.parentElement?.clientHeight || 480;
        };
        resize();
        window.addEventListener("resize", resize);

        function draw() {
            if (!ctx || !canvas) return;
            frame++;
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            // Clear
            ctx.fillStyle = "#000508"; // Very dark cyan/black
            ctx.fillRect(0, 0, w, h);

            // Grid Color
            const r = danger > 50 ? 255 : 0;
            const g = danger > 50 ? 50 : 255;
            const b = danger > 50 ? 50 : 255;

            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.lineWidth = 1;

            // Perspective Grid
            // Moving floor lines (horizontal)
            const speed = 2; // Movement speed
            const horizon = cy;
            const fov = 300;

            // Vertical lines fan out from center
            for (let i = -10; i <= 10; i++) {
                const xOffset = i * 100;
                ctx.beginPath();
                ctx.moveTo(cx, horizon);
                ctx.lineTo(cx + xOffset * 4, h);
                ctx.stroke();
            }

            // Horizontal lines (Z-depth)
            // Logarithmic spacing for perspective
            const timeOffset = (frame * speed) % 100;

            for (let z = 10; z < 400; z += 20) {
                const y = horizon + (fov / (z - (timeOffset / 5))) * 20;
                if (y > h) continue;
                if (y < horizon) continue;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.globalAlpha = 1 - ((y - horizon) / (h - horizon)); // Fade near bottom
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Add "Data Stick" particles
            ctx.fillStyle = "#fff";
            for (let i = 0; i < 5; i++) {
                const x = (Math.sin(frame * 0.01 + i) * w / 2) + cx;
                const y = (Math.cos(frame * 0.02 + i) * h / 3) + cy;
                ctx.fillRect(x, y, 2, 2);
            }

            requestAnimationFrame(draw);
        }

        const anim = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(anim);
            window.removeEventListener("resize", resize);
        };
    }, [danger]);

    return (
        <div className="relative w-full h-64 md:h-full border border-green-900 rounded-lg overflow-hidden bg-black shadow-[0_0_15px_rgba(0,255,100,0.1)]">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] contrast-[200%] opacity-20"></div>
            <div className="absolute top-2 left-2 font-mono text-xs text-green-500 animate-pulse">
                SYS.VISUAL // {danger > 50 ? "ALERT" : "ONLINE"}
            </div>
        </div>
    );
}
