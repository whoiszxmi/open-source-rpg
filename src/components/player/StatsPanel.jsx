import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";

const STAT_LABELS = {
  FORCE: "Força",
  AGILITY: "Agilidade",
  RESIST: "Resistência",
  OUTPUT: "Output",
  CONTROL: "Controle",
  EA: "EA",
  INT: "Intelecto",
  FOCUS: "Foco",
  ACCUMULATION: "Acúmulo",
};

function StatGroup({ title, group }) {
  if (!group) return null;
  const stats = group.stats || [];
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-sm font-semibold text-white">{title}</div>
      {stats.length === 0 ? (
        <div className="text-xs text-white/50">Sem dados.</div>
      ) : (
        <div className="space-y-1 text-sm">
          {stats.map((stat) => (
            <div key={stat.id} className="flex justify-between text-white/70">
              <span>{STAT_LABELS[stat.key] || stat.key}</span>
              <span className="text-white tabular-nums">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatsPanel({
  statsPhysical,
  statsJujutsu,
  statsMental,
  statsExtra,
}) {
  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Status por grupo</div>
        <div className="text-xs text-white/60">Físico, Jujutsu, Mental e Extra</div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <StatGroup title="Físicos" group={statsPhysical} />
        <StatGroup title="Jujutsu" group={statsJujutsu} />
        <StatGroup title="Mentais" group={statsMental} />
        <StatGroup title="Extra" group={statsExtra} />
      </CardContent>
    </Card>
  );
}
