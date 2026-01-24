import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import Button from "../ui/Button";

export default function ActionBar({
  onRoll,
  onReinforce,
  onEmotionalBoost,
  onAttack,
  busy,
}) {
  const [reinforce, setReinforce] = useState(2);
  const [boost, setBoost] = useState(5);

  const can = useMemo(() => !busy, [busy]);

  return (
    <Card>
      <CardHeader>
        <div className="text-white font-semibold">Ações rápidas</div>
        <div className="text-white/60 text-xs">
          Tudo aqui chama o backend (seguro).
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
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

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm font-medium">
                Reforçar corpo
              </div>
              <div className="text-white/60 text-xs">
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

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm font-medium">
                Boost emocional
              </div>
              <div className="text-white/60 text-xs">Valor</div>
            </div>

            <div className="mt-2 flex gap-2">
              <input
                value={boost}
                onChange={(e) => setBoost(Number(e.target.value))}
                type="number"
                min={1}
                max={20}
                className="h-10 w-24 rounded-xl bg-black/30 border border-white/10 text-white px-3 outline-none"
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

          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="ghost"
              disabled={!can}
              onClick={() => onAttack?.()}
              title="Você vai escolher alvo depois (placeholder)."
            >
              Atacar (placeholder)
            </Button>
          </div>

          <div className="text-white/50 text-xs">
            Dica: deixe a aba <span className="text-white/70">/dice/[id]</span>{" "}
            aberta pra ver o dado animado.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
