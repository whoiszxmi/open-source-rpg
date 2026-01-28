import React from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardSettings() {
  return (
    <LayoutMaster title="Configurações">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Preferências do mestre</div>
        <div className="mt-2 text-sm text-white/60">
          Ajuste integrações e parâmetros do sistema em breve.
        </div>
      </div>
    </LayoutMaster>
  );
}
