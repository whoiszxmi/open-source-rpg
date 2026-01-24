import React from "react";

export default function StatAllocator({ group, onChange }) {
  const stats = group?.stats || [];
  return (
    <div className="p-4 border rounded-2xl border-white/10 bg-black/30">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">
          {group?.type || "Stats"}
        </div>
        <div className="text-xs text-white/60">
          Pontos: {group?.totalPoints ?? 0}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {stats.map((stat) => (
          <div key={stat.id || stat.key} className="flex items-center gap-2">
            <div className="w-32 text-xs text-white/70">{stat.key}</div>
            <input
              type="number"
              min={0}
              value={stat.value ?? 0}
              onChange={(e) =>
                onChange?.(stat.key, Number(e.target.value || 0))
              }
              className="w-24 h-9 px-3 text-white border outline-none rounded-xl bg-black/40 border-white/10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
