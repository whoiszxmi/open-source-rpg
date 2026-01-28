import React from "react";
import { useRouter } from "next/router";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardEntities() {
  const router = useRouter();

  return (
    <LayoutMaster title="Entidades">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Personagens</div>
          <div className="mt-2 text-sm text-white/60">
            Gerencie fichas, atributos e aparências dos personagens.
          </div>
          <button
            className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            onClick={() => router.push("/dashboard/characters")}
          >
            Abrir personagens
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Regras e cenários</div>
          <div className="mt-2 text-sm text-white/60">
            Ajuste regras do sistema e cenários disponíveis.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/rules")}
            >
              Regras
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/scenes")}
            >
              Cenários
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/blessings")}
            >
              Bênçãos
            </button>
          </div>
        </div>
      </div>
    </LayoutMaster>
  );
}
