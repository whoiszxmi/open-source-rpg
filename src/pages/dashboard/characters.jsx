import React from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";
import { prisma } from "../../database";

export async function getServerSideProps() {
  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      player_name: true,
      level: true,
      is_dead: true,
    },
    orderBy: { name: "asc" },
  });

  return {
    props: {
      characters: JSON.parse(JSON.stringify(characters)),
    },
  };
}

export default function DashboardCharacters({ characters }) {
  return (
    <LayoutMaster title="Personagens">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Lista de personagens</div>
        <div className="mt-4 space-y-2">
          {characters.length === 0 ? (
            <div className="text-sm text-white/60">Nenhum personagem.</div>
          ) : (
            characters.map((ch) => (
              <div
                key={ch.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              >
                <div>
                  <div className="text-white">{ch.name}</div>
                  <div className="text-xs text-white/50">
                    Jogador: {ch.player_name || "—"}
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  Nível {ch.level} • {ch.is_dead ? "Morto" : "Ativo"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </LayoutMaster>
  );
}
