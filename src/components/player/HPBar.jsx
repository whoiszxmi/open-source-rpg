import React from "react";

export default function HPBar({ current = 0, max = 0 }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>HP</span>
        <span>
          {current}/{max}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/10">
        <div
          className="h-2 bg-red-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
