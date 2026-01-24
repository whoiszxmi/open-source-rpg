import React from "react";

export default function AccumulationShop({ balance = 0, children }) {
  return (
    <div className="p-4 border rounded-2xl border-white/10 bg-black/30">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Acúmulo</div>
        <div className="text-xs text-white/60">Saldo: {balance}</div>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
