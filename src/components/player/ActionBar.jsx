import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import Button from "../ui/Button";

export default function ActionBar({
  onRoll,
  onReinforce,
  onEmotionalBoost,
  onAttack,
  busy,

  // ✅ alvo
  targets = [],
  selectedTargetId = null,
  onChangeTarget,
}) {
  const [reinforce, setReinforce] = useState(2);
  const [boost, setBoost] = useState(5);

  const can = useMemo(() => !busy, [busy]);

  const hasTargets = (targets || []).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Ações rápidas</div>
        <div className="text-xs text-white/60">
          Tudo aqui chama o backend (seguro).
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* 🎯 Seleção de alvo */}
          <div className="p-3 border rounded-2xl border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-white">Alvo</div>
              <div className="text-xs text-white/60">
                {hasTargets ? "Selecione para atacar" : "Sem alvos"}
              </div>
            </div>

            <div className="mt-2">
              <select
                value={selectedTargetId ?? ""}
                onChange={(e) =>
                  onChangeTarget?.(e.target.value ? Number(e.target.value) : null)
                }
                disabled={!can || !hasTargets}
                className="w-full h-10 px-3 text-white border outline-none rounded-xl bg-black/30 border-white/10"
              >
                {!hasTargets && <option value="">(nenhum alvo)</option>}
                {hasTargets && (
                  <>
                    <option value="">(selecione)</option>
                    {targets.map((t) => (
                      <option key={t.id} value={t.id} disabled={t.is_dead}>
                        {t.name} {t.is_dead ? "☠️" : ""}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="mt-2 text-xs text-white/50">
              A técnica é selecionada na lista{" "}
              <span className="text-white/70">Técnicas Inatas</span> abaixo.
            </div>
          </div>

          {/* 🎲 Rolls */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!can}
              onClick={() => onRoll?.({ max_number: 20, times: 1 })}
            >
              Rolar d20
            </Button>
            <Button
              className="flex-1"
              variant="ghost"
              disabled={!can}
              onClick={() => onRoll?.({ max_number: 6, times: 1 })}
            >
              Rolar d6
            </Button>
          </div>

          {/* 💪 Reforço */}
          <div className="p-3 border rounded-2xl border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-white">Reforçar corpo</div>
              <div className="text-xs text-white/60">
                Intensidade: {reinforce}
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={reinforce}
              onChange={(e) => setReinforce(Number(e.target.value))}
              className="w-full mt-2"
              disabled={!can}
            />
            <div className="mt-2">
              <Button
                variant="ghost"
                disabled={!can}
                onClick={() => onReinforce?.(reinforce)}
              >
                Aplicar reforço
              </Button>
            </div>
          </div>

          {/* 🔥 Boost emocional */}
          <div className="p-3 border rounded-2xl border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-white">Boost emocional</div>
              <div className="text-xs text-white/60">Valor</div>
            </div>

            <div className="flex gap-2 mt-2">
              <input
                value={boost}
                onChange={(e) => setBoost(Number(e.target.value))}
                type="number"
                min={1}
                max={20}
                disabled={!can}
                className="w-24 h-10 px-3 text-white border outline-none rounded-xl bg-black/30 border-white/10"
              />
              <Button
                variant="ghost"
                disabled={!can}
                onClick={() => onEmotionalBoost?.(boost)}
              >
                Aplicar boost
              </Button>
            </div>
          </div>

          {/* ⚔️ Atacar real */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!can || !selectedTargetId}
              onClick={() => onAttack?.({})}
              title={!selectedTargetId ? "Selecione um alvo primeiro." : "Ataca o alvo selecionado"}
            >
              Atacar
            </Button>
          </div>

          <div className="text-xs text-white/50">
            Dica: deixe a aba <span className="text-white/70">/dice/[id]</span>{" "}
            aberta pra ver o dado animado.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
