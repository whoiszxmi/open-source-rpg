import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";

export default function BlackFlashPanel({ blackFlashState }) {
  const turns = blackFlashState?.activeTurns ?? 0;
  const next = blackFlashState?.nextThreshold ?? 0;
  const active = turns > 0;

  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Black Flash</div>
        <div className="text-xs text-white/60">
          Estado atual e próximos gatilhos
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
          {active ? (
            <>
              <div className="text-white">
                Ativo • {turns} turno{turns === 1 ? "" : "s"} restante{turns === 1 ? "" : "s"}
              </div>
              <div className="text-xs text-white/50">
                Próximo gatilho em {next} pontos.
              </div>
            </>
          ) : (
            <div className="text-xs text-white/50">
              Nenhum estado ativo no momento.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
