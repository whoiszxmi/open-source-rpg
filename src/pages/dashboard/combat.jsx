import React, { useEffect, useState } from "react";
import { prisma } from "../../database";
import LayoutMaster from "../../components/layout/LayoutMaster";

export async function getServerSideProps() {
  const combats = await prisma.combat.findMany({
    select: { id: true, name: true, isActive: true, roundNumber: true },
    orderBy: { id: "desc" },
    take: 20,
  });

  return { props: { combats: JSON.parse(JSON.stringify(combats)) } };
}

export default function DashboardCombat({ combats }) {
  const [combatId, setCombatId] = useState("");
  const [storedCombatId, setStoredCombatId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("rpg:lastCombatId");
    if (stored && /^\d+$/.test(stored)) {
      setStoredCombatId(Number(stored));
    }
  }, []);

  function onSave(e) {
    e.preventDefault();
    if (!/^\d+$/.test(combatId)) return;
    localStorage.setItem("rpg:lastCombatId", combatId);
    setStoredCombatId(Number(combatId));
    setCombatId("");
  }

  return (
    <LayoutMaster title="Combate">
      <div className="mb-4 flex flex-wrap gap-3">
        <a
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          href="/dashboard/combat/new"
        >
          Novo combate
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Último combate</div>
          <div className="mt-2 text-sm text-white/60">
            {storedCombatId
              ? `Combate #${storedCombatId}`
              : "Nenhum combate salvo."}
          </div>
          <form onSubmit={onSave} className="mt-3 flex gap-2">
            <input
              value={combatId}
              onChange={(e) => setCombatId(e.target.value)}
              placeholder="ID do combate"
              className="h-10 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            />
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
              type="submit"
            >
              Salvar
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Combates recentes</div>
          <div className="mt-3 space-y-2 text-sm text-white/60">
            {(combats || []).length === 0 ? (
              <div>Nenhum combate criado ainda.</div>
            ) : (
              combats.map((combat) => (
                <div key={combat.id} className="flex items-center justify-between">
                  <span>
                    #{combat.id} • {combat.name || "Sem nome"}
                  </span>
                  <span className="text-xs text-white/40">
                    {combat.isActive ? "Ativo" : "Inativo"} • R{combat.roundNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </LayoutMaster>
  );
}
