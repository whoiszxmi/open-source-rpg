import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import Button from "../ui/Button";

const TYPES = [
  { key: "EXPANSION", label: "Expansão" },
  { key: "SIMPLE", label: "Domínio Simples" },
  { key: "BASKET", label: "Cesta (Hollow Wicker)" },
  { key: "AMPLIFICATION", label: "Amplificação" },
];

export default function DomainPanel({ domainState, onActivate, busy }) {
  const active =
    domainState && Number(domainState.turnsRemaining || 0) > 0
      ? domainState
      : null;

  return (
    <Card>
      <CardHeader>
        <div className="text-white font-semibold">Domínio</div>
        <div className="text-white/60 text-xs">
          Sure-hit depende do tipo e da anulação do alvo.
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-white text-sm">
              {active ? (
                <>
                  Ativo: <span className="font-semibold">{active.type}</span> •{" "}
                  <span className="text-white/70">
                    {active.turnsRemaining} turnos
                  </span>
                </>
              ) : (
                <span className="text-white/70">Nenhum domínio ativo</span>
              )}
            </div>
            {active?.notes ? (
              <div className="text-white/60 text-xs mt-2">{active.notes}</div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <Button
                key={t.key}
                variant="ghost"
                disabled={!!busy}
                onClick={() => onActivate?.(t.key)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
