import React from "react";
import { useRouter } from "next/router";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardPlayers() {
  const router = useRouter();

  return (
    <LayoutMaster title="Jogadores">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Acesso rápido</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/characters")}
            >
              Lista de personagens
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/overview")}
            >
              Visão geral
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Sessões ativas</div>
          <div className="mt-2 text-sm text-white/60">
            Use o painel de personagens para abrir fichas e acompanhar o
            progresso dos jogadores.
          </div>
        </div>
      </div>
    </LayoutMaster>
  );
}
