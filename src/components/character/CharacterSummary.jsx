import React from "react";

export default function CharacterSummary({ character, balance, rank }) {
  return (
    <div className="p-4 border rounded-2xl border-white/10 bg-black/30">
      <div className="text-sm font-semibold text-white">Resumo</div>
      <div className="mt-2 text-xs text-white/70">
        Nome: {character?.name || "—"}
      </div>
      <div className="text-xs text-white/70">
        Nível: {character?.level ?? 1}
      </div>
      <div className="text-xs text-white/70">
        Rank: {rank || "F"}
      </div>
      <div className="text-xs text-white/70">
        Saldo de Acúmulo: {balance ?? 0}
      </div>
    </div>
  );
}
