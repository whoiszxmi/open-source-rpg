import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";

export default function CombatContextPanel({ combat, combatId, targets = [] }) {
  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Contexto de combate</div>
        <div className="text-xs text-white/60">
          Combate ativo, turno e alvos
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-white/70">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div>Combat ID: {combatId || "—"}</div>
          <div>Rodada: {combat?.roundNumber ?? "—"}</div>
          <div>Turno atual: {combat?.turnIndex ?? "—"}</div>
          <div>Ator atual: {combat?.currentActorId ?? "—"}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-sm font-semibold text-white">Alvos</div>
          {targets.length === 0 ? (
            <div className="text-xs text-white/50">Nenhum alvo disponível.</div>
          ) : (
            <ul className="space-y-1 text-xs">
              {targets.map((target) => (
                <li key={target.id} className="flex justify-between">
                  <span>{target.name}</span>
                  <span className="text-white/50">
                    {target.is_dead ? "Morto" : "Vivo"}
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
