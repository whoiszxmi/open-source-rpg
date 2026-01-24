import React from "react";

export default function DiceWindow({ rolls = [] }) {
  return (
    <div className="p-3 border rounded-2xl border-white/10 bg-white/5">
      <div className="text-sm font-semibold text-white">Dados</div>
      <div className="mt-2 text-xs text-white/70">
        {rolls.length === 0
          ? "Nenhuma rolagem ainda."
          : rolls.map((roll, idx) => (
              <span key={`${roll}-${idx}`} className="mr-2">
                {roll}
              </span>
            ))}
      </div>
    </div>
  );
}
