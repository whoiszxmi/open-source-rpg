import React, { useEffect, useRef } from "react";

export default function SpritePreview({ label = "Preview", fps = 6 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let raf;
    let last = performance.now();

    function draw(now) {
      const delta = now - last;
      if (delta >= 1000 / fps) {
        last = now;
        frame = (frame + 1) % 6;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(8 + frame * 6, 12, 24, 24);
        ctx.fillStyle = "#a5b4fc";
        ctx.fillRect(12, 16 + frame, 16, 16);
      }
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [fps]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
      <div className="mb-2 text-white/80">{label}</div>
      <canvas ref={canvasRef} width={64} height={64} className="rounded-lg" />
    </div>
  );
}
