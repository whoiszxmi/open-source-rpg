import React from "react";
import { prisma } from "../../database";
import LayoutMaster from "../../components/layout/LayoutMaster";

export async function getServerSideProps() {
  const scenarios = await prisma.scenario.findMany({
    select: { id: true, name: true, backgroundAssetId: true },
    orderBy: { createdAt: "desc" },
  });

  return { props: { scenarios: JSON.parse(JSON.stringify(scenarios)) } };
}

export default function DashboardScenarios({ scenarios }) {
  return (
    <LayoutMaster title="Cenários">
      <div className="mb-4">
        <a
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          href="/dashboard/scenarios/new"
        >
          Novo cenário
        </a>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(scenarios || []).length === 0 ? (
          <div className="text-sm text-white/60">
            Nenhum cenário criado ainda.
          </div>
        ) : (
          scenarios.map((scene) => (
            <div
              key={scene.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="text-sm font-semibold text-white">{scene.name}</div>
              <div className="text-xs text-white/40">
                Asset: {scene.backgroundAssetId || "nenhum"}
              </div>
            </div>
          ))
        )}
      </div>
    </LayoutMaster>
  );
}
