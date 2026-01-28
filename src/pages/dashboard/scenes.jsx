import React from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardScenes() {
  return (
    <LayoutMaster title="Cenários">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Cenários</div>
        <div className="mt-2 text-sm text-white/60">
          Configure cenários e associe a combates.
        </div>
      </div>
    </LayoutMaster>
  );
}
