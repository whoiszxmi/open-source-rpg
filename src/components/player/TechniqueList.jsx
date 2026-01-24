import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import Button from "../ui/Button";

export default function TechniqueList({ techniques = [], onUse, busy }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-white font-semibold">Técnicas Inatas</div>
        <div className="text-white/60 text-xs">
          Use e o backend resolve custo e efeitos.
        </div>
      </CardHeader>

      <CardContent>
        {techniques.length === 0 ? (
          <div className="text-white/60 text-sm">
            Nenhuma técnica cadastrada.
          </div>
        ) : (
          <div className="space-y-3">
            {techniques.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">
                      {t.name}
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      Custo: <span className="text-white/80">{t.cost}</span> EA
                    </div>
                    {t.effect ? (
                      <div className="text-white/60 text-xs mt-2">
                        {t.effect}
                      </div>
                    ) : null}
                  </div>

                  <Button
                    variant="ghost"
                    disabled={!!busy}
                    onClick={() => onUse?.(t)}
                  >
                    Usar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
