import React, { useState } from "react";
import { prisma } from "../../../database";
import { postJSON } from "../../../lib/api";
import LayoutMaster from "../../../components/layout/LayoutMaster";

export async function getServerSideProps() {
  const [players, enemies, scenarios] = await Promise.all([
    prisma.character.findMany({
      where: { is_npc: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.character.findMany({
      where: { is_npc: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.scene.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    props: {
      players: JSON.parse(JSON.stringify(players)),
      enemies: JSON.parse(JSON.stringify(enemies)),
      scenarios: JSON.parse(JSON.stringify(scenarios)),
    },
  };
}

export default function CombatNew({ players, enemies, scenarios }) {
  const [name, setName] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedEnemies, setSelectedEnemies] = useState([]);
  const [status, setStatus] = useState("");

  function toggleSelected(list, id, setList) {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    const participants = [...selectedPlayers, ...selectedEnemies];
    if (participants.length === 0) {
      setStatus("Selecione ao menos um participante.");
      return;
    }

    try {
      const created = await postJSON("/api/combat/create", {
        name,
        scenarioId: scenarioId ? Number(scenarioId) : null,
        participantIds: participants,
      });
      const combatId = created?.combat?.id;
      if (!combatId) {
        setStatus("Falha ao criar combate.");
        return;
      }
      await postJSON("/api/combat/start", { combatId });
      if (typeof window !== "undefined") {
        localStorage.setItem("rpg:lastCombatId", String(combatId));
      }
      setStatus(`Combate #${combatId} iniciado.`);
    } catch (ex) {
      setStatus(ex.message || "Falha ao iniciar combate.");
    }
  }

  return (
    <LayoutMaster title="Novo combate">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Dados básicos</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do combate"
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            />
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            >
              <option value="">Sem cenário</option>
              {(scenarios || []).map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Jogadores</div>
            <div className="mt-3 space-y-2 text-sm">
              {(players || []).length === 0 ? (
                <div className="text-white/60">Nenhum jogador cadastrado.</div>
              ) : (
                players.map((player) => (
                  <label key={player.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() =>
                        toggleSelected(
                          selectedPlayers,
                          player.id,
                          setSelectedPlayers,
                        )
                      }
                    />
                    <span>{player.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Inimigos</div>
            <div className="mt-3 space-y-2 text-sm">
              {(enemies || []).length === 0 ? (
                <div className="text-white/60">Nenhum inimigo cadastrado.</div>
              ) : (
                enemies.map((enemy) => (
                  <label key={enemy.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedEnemies.includes(enemy.id)}
                      onChange={() =>
                        toggleSelected(
                          selectedEnemies,
                          enemy.id,
                          setSelectedEnemies,
                        )
                      }
                    />
                    <span>{enemy.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
        >
          Iniciar combate
        </button>

        {status ? <div className="text-sm text-white/60">{status}</div> : null}
      </form>
    </LayoutMaster>
  );
}
