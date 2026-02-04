import { z } from "zod";
import { useEffect, useRef } from "react";

export function DungeonCanvas(props: { location: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;

    // Resize handler
    const resize = () => {
      c.width = c.parentElement?.clientWidth || 320;
      c.height = c.parentElement?.clientHeight || 200;
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;

    function draw() {
      frame++;
      const w = c.width;
      const h = c.height;

      // Dark BG
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      // Perspective Grid (The "Tunnel" Effect)
      ctx.strokeStyle = "rgba(100, 100, 100, 0.2)";
      ctx.lineWidth = 1;

      const centerX = w / 2;
      const centerY = h / 2;

      // Moving floor
      const offset = (frame * 2) % 40;

      for (let y = centerY; y < h; y += 40) {
        // Horizontal lines
        ctx.beginPath();
        const yPos = y + offset;
        if (yPos < h) {
          ctx.moveTo(0, yPos);
          ctx.lineTo(w, yPos);
        }
        ctx.stroke();
      }

      // Vanishing lines
      for (let x = 0; x <= w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
      }

      // Mood Lighting (Torch)
      const glow = 100 + Math.sin(frame / 15) * 20;
      const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, w / 1.5);
      gradient.addColorStop(0, "rgba(88, 28, 135, 0.1)"); // Purple center
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(draw);
    }

    draw();
    return () => window.removeEventListener('resize', resize);
  }, [props.location]);

  return (
    <canvas
      ref={ref}
      className="w-full h-full block object-cover"
    />
  );
}

DungeonCanvas.propsSchema = z.object({
  location: z.string(),
});
