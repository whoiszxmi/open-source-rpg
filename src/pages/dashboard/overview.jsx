import React from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardOverview() {
  return (
    <LayoutMaster title="Visão geral">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Personagens ativos", value: "—" },
          { label: "Combates ativos", value: "—" },
          { label: "Eventos recentes", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-xs text-white/60">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Resumo do sistema</div>
        <div className="mt-2 text-sm text-white/60">
          Use as abas para gerenciar personagens, combates, packs visuais e
          cenários.
        </div>
      </div>
    </LayoutMaster>
  );
}
