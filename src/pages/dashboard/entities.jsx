import React from "react";
import { useRouter } from "next/router";
import { prisma } from "../../database";
import LayoutMaster from "../../components/layout/LayoutMaster";

export async function getServerSideProps() {
  const enemies = await prisma.enemyTemplate.findMany({
    select: { id: true, name: true, baseStatsJson: true },
    orderBy: { name: "asc" },
  });

  return { props: { enemies: JSON.parse(JSON.stringify(enemies)) } };
}

export default function DashboardEntities({ enemies }) {
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
          <button
            className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            onClick={() => router.push("/dashboard/entities/new")}
          >
            Novo inimigo
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Inimigos cadastrados</div>
          <div className="mt-3 space-y-2 text-sm text-white/60">
            {(enemies || []).length === 0 ? (
              <div>Nenhum inimigo cadastrado.</div>
            ) : (
              enemies.map((enemy) => (
                <div key={enemy.id} className="flex items-center justify-between">
                  <span>{enemy.name}</span>
                  <span className="text-xs text-white/40">
                    {enemy.baseStatsJson?.hp
                      ? `HP ${enemy.baseStatsJson.hp}`
                      : "Sem stats"}
                  </span>
                  <button
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
                    onClick={() =>
                      router.push(`/dashboard/entities/${enemy.id}/appearance`)
                    }
                  >
                    Aparência
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </LayoutMaster>
  );
}
