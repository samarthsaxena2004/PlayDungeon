import { z } from "zod";
import { useEffect, useRef } from "react";

export function DungeonCanvas(props: { location: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;

    let frame = 0;

    function draw() {
      frame++;

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, c.width, c.height);

      // Torch flicker
      const glow = 60 + Math.sin(frame / 6) * 20;

      ctx.fillStyle = `rgba(255,140,0,0.2)`;
      ctx.beginPath();
      ctx.arc(160, 100, glow, 0, Math.PI * 2);
      ctx.fill();

      // Room text
      ctx.fillStyle = "#fff";
      ctx.font = "14px monospace";
      ctx.fillText(`[${props.location.toUpperCase()}]`, 20, 20);

      requestAnimationFrame(draw);
    }

    draw();
  }, [props.location]);

  return (
    <div className="border-4 border-white relative crt">
      <canvas
        ref={ref}
        width={320}
        height={200}
        className="w-full h-[260px]"
      />
    </div>
  );
}

DungeonCanvas.propsSchema = z.object({
  location: z.string(),
});
