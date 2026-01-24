import React from "react";

export default function BlessingSelector({ blessings = [], onSelect }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-white">Bênçãos</div>
      {blessings.length === 0 && (
        <div className="text-xs text-white/60">Sem bênçãos disponíveis.</div>
      )}
      {blessings.map((blessing) => (
        <button
          key={blessing.key || blessing.id}
          className="flex items-center justify-between w-full px-3 py-2 text-left border rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => onSelect?.(blessing)}
        >
          <span className="text-sm text-white">{blessing.name}</span>
          <span className="text-xs text-white/60">Custo {blessing.cost}</span>
        </button>
      ))}
    </div>
  );
}
