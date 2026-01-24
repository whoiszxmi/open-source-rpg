import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";

export default function CombatFeed({ items = [] }) {
  const last = items.slice(-12).reverse();
  return (
    <Card className="border-white/10 bg-gradient-to-br from-zinc-950 via-slate-950/40 to-zinc-900">
      <CardHeader>
        <div className="text-white font-semibold">Feed</div>
        <div className="text-white/60 text-xs">
          Notas e resultados recentes.
        </div>
      </CardHeader>
      <CardContent>
        {last.length === 0 ? (
          <div className="text-white/60 text-sm">Sem eventos ainda.</div>
        ) : (
          <div className="space-y-2">
            {last.map((it, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 shadow-[0_0_20px_rgba(99,102,241,0.08)]"
              >
                {it}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
