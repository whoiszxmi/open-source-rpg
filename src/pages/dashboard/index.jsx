import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardIndex() {
  const router = useRouter();
  const [lastTab, setLastTab] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("rpg:master:lastTab");
    if (stored && stored !== "/dashboard") {
      setLastTab(stored);
    }
  }, []);

  return (
    <LayoutMaster title="Hub do Mestre">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Atalhos rápidos</div>
          <div className="mt-3 flex flex-wrap gap-3">
            {lastTab ? (
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                onClick={() => router.push(lastTab)}
              >
                Ir para última aba
              </button>
            ) : null}
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/combat")}
            >
              Combate
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/players")}
            >
              Jogadores
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/uploads")}
            >
              Uploads/Assets
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              onClick={() => router.push("/dashboard/entities")}
            >
              Entidades
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
            onClick={() => router.push("/dashboard/combat")}
          >
            <div className="text-sm text-white/60">Combate</div>
            <div className="mt-2 text-lg font-semibold">
              Encontre combates ativos
            </div>
            <div className="mt-2 text-xs text-white/50">
              Último combate e controle de rodada.
            </div>
          </button>

          <button
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
            onClick={() => router.push("/dashboard/players")}
          >
            <div className="text-sm text-white/60">Jogadores</div>
            <div className="mt-2 text-lg font-semibold">
              Acompanhar sessões
            </div>
            <div className="mt-2 text-xs text-white/50">
              Abra fichas e gerencie acessos.
            </div>
          </button>

          <button
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
            onClick={() => router.push("/dashboard/entities")}
          >
            <div className="text-sm text-white/60">Entidades</div>
            <div className="mt-2 text-lg font-semibold">
              Personagens e regras
            </div>
            <div className="mt-2 text-xs text-white/50">
              Gerencie criaturas, cenários e regras.
            </div>
          </button>
        </div>
      </div>
    </LayoutMaster>
  );
}
