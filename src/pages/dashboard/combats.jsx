import React from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardCombats() {
  return (
    <LayoutMaster title="Combates">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Combates ativos</div>
          <div className="mt-2 text-sm text-white/60">
            Nenhum combate ativo no momento.
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Controles rápidos</div>
          <div className="mt-3 space-y-2 text-sm text-white/60">
            <div>• Criar combate com participantes.</div>
            <div>• Forçar turno e marcar ações.</div>
            <div>• Aplicar status e ver logs.</div>
          </div>
        </div>
      </div>
    </LayoutMaster>
  );
}
