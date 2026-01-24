import React from "react";

export default function CurseSelector({ curses = [], onSelect }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-white">Maldições</div>
      {curses.length === 0 && (
        <div className="text-xs text-white/60">Sem maldições disponíveis.</div>
      )}
      {curses.map((curse) => (
        <button
          key={curse.key || curse.id}
          className="flex items-center justify-between w-full px-3 py-2 text-left border rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => onSelect?.(curse)}
        >
          <span className="text-sm text-white">{curse.name}</span>
          <span className="text-xs text-white/60">Recompensa {curse.reward}</span>
        </button>
      ))}
    </div>
  );
}
