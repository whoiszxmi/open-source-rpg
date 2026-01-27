import React from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";
import controlCostModifiers from "../../config/control-cost-modifiers.json";
import xpTable from "../../config/xp-table.json";

export default function DashboardRules() {
  return (
    <LayoutMaster title="Regras">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Controle → custo</div>
          <div className="mt-3 space-y-1 text-xs text-white/70">
            {Object.entries(controlCostModifiers).map(([rank, mod]) => (
              <div key={rank} className="flex justify-between">
                <span>{rank}</span>
                <span>{Math.round(mod * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Tabela de XP</div>
          <div className="mt-3 space-y-1 text-xs text-white/70">
            {Object.entries(xpTable).map(([level, value]) => (
              <div key={level} className="flex justify-between">
                <span>Nível {level}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutMaster>
  );
}
