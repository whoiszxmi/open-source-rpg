import React from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";
import blessingsCatalog from "../../config/blessings.json";
import cursesCatalog from "../../config/curses.json";

function CatalogCard({ title, items, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-white">{item.name}</div>
              <div className={`text-xs ${tone}`}>Rank {item.rank}</div>
            </div>
            <div className="text-xs text-white/50">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardBlessings() {
  return (
    <LayoutMaster title="Bênçãos & Maldições">
      <div className="grid gap-4 lg:grid-cols-2">
        <CatalogCard
          title="Catálogo de bênçãos"
          items={blessingsCatalog}
          tone="text-emerald-300"
        />
        <CatalogCard
          title="Catálogo de maldições"
          items={cursesCatalog}
          tone="text-rose-300"
        />
      </div>
    </LayoutMaster>
  );
}
