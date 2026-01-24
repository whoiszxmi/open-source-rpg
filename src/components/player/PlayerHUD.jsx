import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import Progress from "../ui/Progress";
import Chip from "../ui/Chip";

function pct(current, max) {
  const c = Number(current || 0);
  const m = Math.max(1, Number(max || 1));
  return Math.round((c / m) * 100);
}

export default function PlayerHUD({
  character,
  cursedStats,
  domainState,
  statuses,
}) {
  const hp = {
    cur: character?.current_hit_points ?? 0,
    max: character?.max_hit_points ?? 0,
  };

  const ce = {
    cur: cursedStats?.cursedEnergy ?? 0,
    max: cursedStats?.cursedEnergyMax ?? 0,
  };

  const pm = cursedStats?.mentalPressure ?? 0;
  const cc = cursedStats?.cursedControl ?? 0;

  const activeDomain =
    domainState && Number(domainState.turnsRemaining || 0) > 0
      ? domainState
      : null;

  const statusList = (statuses || [])
    .filter((s) => Number(s.turnsRemaining || 0) > 0)
    .slice(0, 12);

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-zinc-950 via-purple-950/40 to-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 p-[1px]">
            <div className="h-full w-full rounded-xl bg-black/60 overflow-hidden">
            {character?.standard_character_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={character.standard_character_picture_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          </div>

          <div className="min-w-0">
            <div className="text-white font-semibold tracking-wide truncate">
              {character?.name || "Jogador"}
            </div>
            <div className="text-white/60 text-xs">
              {character?.player_name
                ? `Jogador: ${character.player_name}`
                : "Modo Jogador"}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {activeDomain ? (
            <Chip tone="info">
              Domínio: {activeDomain.type} • {activeDomain.turnsRemaining}t
            </Chip>
          ) : (
            <Chip tone="neutral">Sem Domínio ativo</Chip>
          )}

          {cursedStats?.domainUnlocked ? (
            <Chip tone="good">Domínio desbloqueado</Chip>
          ) : (
            <Chip tone="warn">Domínio bloqueado</Chip>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-4">
          {/* HP */}
          <div>
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>HP</span>
              <span className="tabular-nums">
                {hp.cur}/{hp.max}
              </span>
            </div>
            <Progress value={pct(hp.cur, hp.max)} />
          </div>

          {/* CE */}
          <div>
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>EA (Energia Amaldiçoada)</span>
              <span className="tabular-nums">
                {ce.cur}/{ce.max}
              </span>
            </div>
            <Progress value={pct(ce.cur, ce.max)} />
          </div>

          {/* PM / CC */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-white/60 text-xs">PM</div>
              <div className="text-white font-semibold tabular-nums">{pm}</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-white/60 text-xs">CC</div>
              <div className="text-white font-semibold tabular-nums">{cc}</div>
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="text-white/60 text-xs mb-2">Status</div>
            <div className="flex flex-wrap gap-2">
              {statusList.length === 0 ? (
                <Chip tone="neutral">Nenhum</Chip>
              ) : (
                statusList.map((s) => (
                  <Chip
                    key={s.id}
                    tone={
                      String(s.kind || "").toUpperCase() === "BUFF"
                        ? "good"
                        : "bad"
                    }
                  >
                    {String(s.key)} • {s.turnsRemaining}t
                  </Chip>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
