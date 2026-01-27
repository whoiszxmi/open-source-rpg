import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import controlCostModifiers from "../../config/control-cost-modifiers.json";
import blessingsCatalog from "../../config/blessings.json";
import cursesCatalog from "../../config/curses.json";

const STAT_LABELS = {
  OUTPUT: "Output",
  CONTROL: "Controle",
  EA: "EA",
  INT: "Conhecimento",
  ACCUMULATION: "Acúmulo",
};

function getStatValue(group, key) {
  if (!group?.stats) return 0;
  const row = group.stats.find((s) => String(s.key) === key);
  return row ? Number(row.value || 0) : 0;
}

function formatEffectStats(effects) {
  const stats = effects?.stats || {};
  const entries = Object.entries(stats);
  if (entries.length === 0) return "Sem modificadores.";
  return entries
    .map(([key, value]) => {
      const num = Number(value || 0);
      const sign = num > 0 ? "+" : "";
      return `${STAT_LABELS[key] || key} ${sign}${num}`;
    })
    .join(", ");
}

function StoreCard({ title, items, tone, labelKey }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-sm font-semibold text-white">{title}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-white/10 bg-black/30 p-2 text-xs"
          >
            <div className="flex items-center justify-between text-white">
              <span>{item.name}</span>
              <span className={tone}>
                {labelKey}: {item[labelKey]}
              </span>
            </div>
            <div className="text-white/50">{formatEffectStats(item.effects)}</div>
            <button
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 py-1 text-xs text-white/60"
              disabled
            >
              Em breve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TraitsPanel({
  statsExtra,
  statsJujutsu,
  statsMental,
  cursedStats,
  blessings = [],
  curses = [],
}) {
  const accumulation = getStatValue(statsExtra, "ACCUMULATION");
  const output = getStatValue(statsJujutsu, "OUTPUT");
  const control = getStatValue(statsJujutsu, "CONTROL");
  const knowledge = getStatValue(statsMental, "INT");
  const eaTotal = cursedStats?.cursedEnergyMax ?? 0;
  const controlRank = statsJujutsu?.rank || "C";
  const controlModifier = Math.round(
    (controlCostModifiers[controlRank] ?? 0) * 100,
  );
  const curseRewards = curses.reduce(
    (sum, entry) => sum + Number(entry?.curse?.reward || 0),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Traços & Acúmulo</div>
        <div className="text-xs text-white/60">
          Bênçãos, maldições e impacto nas regras
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "EA total", value: eaTotal },
            { label: "Output", value: output },
            { label: "Controle", value: control },
            { label: "Conhecimento", value: knowledge },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="text-xs text-white/60">{item.label}</div>
              <div className="text-lg font-semibold text-white tabular-nums">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
          <div className="flex flex-wrap gap-4">
            <div>
              Acúmulo:{" "}
              <span className="text-white tabular-nums">{accumulation}</span>
            </div>
            <div>
              Pontos de maldição:{" "}
              <span className="text-white tabular-nums">{curseRewards}</span>
            </div>
            <div>
              Modificador de custo:{" "}
              <span className="text-white tabular-nums">
                {controlModifier > 0 ? "+" : ""}
                {controlModifier}%
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-white/50">
            Use acúmulo e recompensas de maldição para comprar bênçãos (em breve).
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-sm font-semibold text-white">Bênçãos</div>
            {blessings.length === 0 ? (
              <div className="text-xs text-white/50">Nenhuma bênção.</div>
            ) : (
              <div className="space-y-2">
                {blessings.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-emerald-200">
                      <span>{entry.blessing?.name}</span>
                      <span>Rank {entry.blessing?.rank}</span>
                    </div>
                    <div className="text-white/60">
                      {formatEffectStats(entry.blessing?.effects)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-sm font-semibold text-white">
              Maldições
            </div>
            {curses.length === 0 ? (
              <div className="text-xs text-white/50">Nenhuma maldição.</div>
            ) : (
              <div className="space-y-2">
                {curses.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-rose-200">
                      <span>{entry.curse?.name}</span>
                      <span>Rank {entry.curse?.rank}</span>
                    </div>
                    <div className="text-white/60">
                      {formatEffectStats(entry.curse?.effects)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <StoreCard
            title="Loja de bênçãos"
            items={blessingsCatalog}
            tone="text-emerald-300"
            labelKey="cost"
          />
          <StoreCard
            title="Loja de maldições"
            items={cursesCatalog}
            tone="text-rose-300"
            labelKey="reward"
          />
        </div>
      </CardContent>
    </Card>
  );
}
