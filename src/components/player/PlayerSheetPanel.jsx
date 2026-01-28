import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import controlCostModifiers from "../../config/control-cost-modifiers.json";
import blessingsCatalog from "../../config/blessings.json";
import cursesCatalog from "../../config/curses.json";

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

const GROUP_LABELS = {
  PHYSICAL: "Físicos",
  JUJUTSU: "Jujutsu",
  MENTAL: "Mentais",
  EXTRA: "Extra",
};

function formatKeyLabel(key) {
  if (!key) return "-";
  return STAT_LABELS[key] || key;
}

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
      return `${formatKeyLabel(key)} ${sign}${num}`;
    })
    .join(", ");
}

function formatCostModifier(value) {
  const pct = Math.round(Number(value || 0) * 100);
  if (pct === 0) return "0%";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function StatGroupCard({ title, group }) {
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
              <span>{formatKeyLabel(stat.key)}</span>
              <span className="text-white tabular-nums">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoreList({ title, items, tone, labelKey }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-sm font-semibold text-white">{title}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-white/10 bg-black/20 p-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white">{item.name}</div>
                <div className="text-xs text-white/50">
                  Rank {item.rank} • {item.category}
                </div>
              </div>
              <div className={`text-xs ${tone}`}>
                {labelKey}: {item[labelKey]}
              </div>
            </div>
            <div className="mt-1 text-xs text-white/60">
              {formatEffectStats(item.effects)}
            </div>
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

export default function PlayerSheetPanel({
  statsPhysical,
  statsJujutsu,
  statsMental,
  statsExtra,
  cursedStats,
  blessings = [],
  curses = [],
}) {
  const output = getStatValue(statsJujutsu, "OUTPUT");
  const control = getStatValue(statsJujutsu, "CONTROL");
  const knowledge = getStatValue(statsMental, "INT");
  const accumulation = getStatValue(statsExtra, "ACCUMULATION");

  const controlRank = statsJujutsu?.rank || "C";
  const controlModifier = formatCostModifier(
    controlCostModifiers[controlRank] ?? 0,
  );

  const curseRewards = curses.reduce(
    (sum, entry) => sum + Number(entry?.curse?.reward || 0),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Ficha & Progressão</div>
        <div className="text-xs text-white/60">
          Estatísticas, acúmulo e traços ativos
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">EA total</div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {cursedStats?.cursedEnergyMax ?? 0}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">Output</div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {output}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">Controle</div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {control}
            </div>
            <div className="text-[10px] text-white/50">
              Modificador de custo: {controlModifier}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">Conhecimento</div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {knowledge}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-sm font-semibold text-white">Acúmulo</div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <div>
              Saldo atual:{" "}
              <span className="text-white tabular-nums">{accumulation}</span>
            </div>
            <div>
              Pontos de maldição:{" "}
              <span className="text-white tabular-nums">{curseRewards}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-white/50">
            Use acúmulo e recompensas de maldição para comprar bênçãos (em breve).
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StatGroupCard title={GROUP_LABELS.PHYSICAL} group={statsPhysical} />
          <StatGroupCard title={GROUP_LABELS.JUJUTSU} group={statsJujutsu} />
          <StatGroupCard title={GROUP_LABELS.MENTAL} group={statsMental} />
          <StatGroupCard title={GROUP_LABELS.EXTRA} group={statsExtra} />
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
                    className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-emerald-200">
                        {entry.blessing?.name}
                      </div>
                      <div className="text-xs text-white/60">
                        Rank {entry.blessing?.rank}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
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
                    className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-rose-200">
                        {entry.curse?.name}
                      </div>
                      <div className="text-xs text-white/60">
                        Rank {entry.curse?.rank}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {formatEffectStats(entry.curse?.effects)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <StoreList
            title="Loja de bênçãos"
            items={blessingsCatalog}
            tone="text-emerald-300"
            labelKey="cost"
          />
          <StoreList
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
