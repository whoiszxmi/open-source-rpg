import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";

function StatGroup({ title, group }) {
  if (!group) return null;

  return (
    <div className="p-3 border rounded-xl border-white/10 bg-white/5">
      <div className="mb-2 font-medium text-white">{title}</div>
      {group.stats.map((s) => (
        <div key={s.id} className="flex justify-between text-sm text-white/70">
          <span>{s.name}</span>
          <span className="text-white">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function CharacterProgressPanel({
  statsPhysical,
  statsJujutsu,
  statsMental,
  statsExtra,
  blessings = [],
  curses = [],
}) {
  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Progressão & Traços</div>
        <div className="text-xs text-white/60">
          Status, bênçãos e maldições ativas
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StatGroup title="Físicos" group={statsPhysical} />
          <StatGroup title="Jujutsu" group={statsJujutsu} />
          <StatGroup title="Mentais" group={statsMental} />
          <StatGroup title="Extra" group={statsExtra} />
        </div>

        {/* Blessings */}
        <div>
          <div className="mb-2 font-medium text-white">Bênçãos</div>
          {blessings.length === 0 ? (
            <div className="text-xs text-white/50">Nenhuma bênção.</div>
          ) : (
            <ul className="space-y-1">
              {blessings.map((b) => (
                <li
                  key={b.id}
                  className="flex justify-between text-sm text-emerald-300"
                >
                  <span>{b.blessing.name}</span>
                  <span className="text-xs text-white/60">
                    Rank {b.blessing.rank}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Curses */}
        <div>
          <div className="mb-2 font-medium text-white">Maldições</div>
          {curses.length === 0 ? (
            <div className="text-xs text-white/50">Nenhuma maldição.</div>
          ) : (
            <ul className="space-y-1">
              {curses.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between text-sm text-rose-300"
                >
                  <span>{c.curse.name}</span>
                  <span className="text-xs text-white/60">
                    Rank {c.curse.rank}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
