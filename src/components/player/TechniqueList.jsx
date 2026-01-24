import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import Button from "../ui/Button";

export default function TechniqueList({
  techniques = [],
  busy,

  // ✅ novos
  selectedTechniqueId = null,
  onSelect, // (technique | null) => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-white">Técnicas Inatas</div>
        <div className="text-xs text-white/60">
          Selecione uma técnica. O “Atacar” resolve custo/efeitos no backend.
        </div>
      </CardHeader>

      <CardContent>
        {techniques.length === 0 ? (
          <div className="text-sm text-white/60">
            Nenhuma técnica cadastrada.
          </div>
        ) : (
          <div className="space-y-3">
            {techniques.map((t) => {
              const selected = Number(selectedTechniqueId) === Number(t.id);

              return (
                <div
                  key={t.id}
                  className={[
                    "rounded-2xl border p-3 transition",
                    selected
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/5",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white truncate">
                          {t.name}
                        </div>
                        {selected ? (
                          <span className="text-xs rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-white/80">
                            Selecionada
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 text-xs text-white/60">
                        Custo: <span className="text-white/80">{t.cost}</span>{" "}
                        EA
                      </div>

                      {t.effect ? (
                        <div className="mt-2 text-xs text-white/60">
                          {t.effect}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2">
                      {selected ? (
                        <Button
                          variant="ghost"
                          disabled={!!busy}
                          onClick={() => onSelect?.(null)}
                          title="Remove a seleção"
                        >
                          Limpar
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          disabled={!!busy}
                          onClick={() => onSelect?.(t)}
                          title="Seleciona essa técnica para o próximo ataque"
                        >
                          Selecionar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* rodapé útil */}
        <div className="mt-3 text-xs text-white/50">
          Dica: algumas técnicas podem aplicar status se o texto tiver tags tipo{" "}
          <span className="text-white/70">STATUS:BURN:2:3</span>.
        </div>
      </CardContent>
    </Card>
  );
}
