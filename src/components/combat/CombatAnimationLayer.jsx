import React, { useEffect, useRef, useState } from "react";
import AssetRegistry from "../../lib/visual/AssetRegistry";
import socket from "../../utils/socket";

const WIDTH = 520;
const HEIGHT = 260;

function drawFallback(ctx, label, x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x - 24, y - 24, 48, 48);
  ctx.fillStyle = "#fff";
  ctx.font = "12px sans-serif";
  ctx.fillText(label, x - 20, y + 32);
}

export default function CombatAnimationLayer({ snapshot, combat }) {
  const canvasRef = useRef(null);
  const [manifest, setManifest] = useState(null);
  const [fxTick, setFxTick] = useState(null);

  const appearance = snapshot?.appearance || null;
  const packId = appearance?.packId || "base_pack";

  useEffect(() => {
    let mounted = true;
    AssetRegistry.loadManifest(packId).then((man) => {
      if (mounted) setManifest(man);
    });
    return () => {
      mounted = false;
    };
  }, [packId]);

  useEffect(() => {
    function handleCombatAction(payload) {
      if (!payload?.combatId || payload.combatId !== combat?.id) return;
      setFxTick(Date.now());
    }
    socket.on("combat:action", handleCombatAction);
    return () => socket.off("combat:action", handleCombatAction);
  }, [combat?.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgba(24,24,27,0.9)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const sceneKey = combat?.sceneKey || snapshot?.scene?.sceneKey || "default";
    const scene = manifest?.scenes?.[sceneKey];
    if (scene?.background) {
      const img = AssetRegistry.preloadImage(
        `${manifest?.basePath || ""}/${scene.background}`,
      );
      if (img.complete) {
        ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
      }
    }

    const sprite = manifest?.sprites?.[appearance?.skinKey || "default"];
    if (sprite?.image) {
      const img = AssetRegistry.preloadImage(
        `${manifest?.basePath || ""}/${sprite.image}`,
      );
      if (img.complete) {
        ctx.drawImage(img, 80, 120, 64, 64);
      } else {
        drawFallback(ctx, "PLAYER", 100, 140);
      }
    } else {
      drawFallback(ctx, "PLAYER", 100, 140);
    }

    drawFallback(ctx, "TARGET", 420, 140);

    if (fxTick) {
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(420, 140, 30, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [manifest, fxTick, appearance, combat]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
