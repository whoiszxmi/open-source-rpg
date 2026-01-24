import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import socket from "../../utils/socket";
import { prisma } from "../../database";
import { postJSON } from "../../lib/api";

import PlayerHUD from "../../components/player/PlayerHUD";
import ActionBar from "../../components/player/ActionBar";
import TechniqueList from "../../components/player/TechniqueList";
import DomainPanel from "../../components/player/DomainPanel";
import CombatFeed from "../../components/player/CombatFeed";

export const getServerSideProps = async ({ params }) => {
  const characterId = isNaN(params.id) ? null : Number(params.id);

  if (!characterId) return { props: { characterId: null, initial: null } };

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: {
      id: true,
      name: true,
      player_name: true,
      current_hit_points: true,
      max_hit_points: true,
      is_dead: true,
      standard_character_picture_url: true,
    },
  });

  if (!character) return { props: { characterId, initial: null } };

  const cursedStats = await prisma.cursedStats.findUnique({
    where: { characterId },
  });

  const domainState = await prisma.domainState.findUnique({
    where: { characterId },
  });

  const statuses = await prisma.combatStatus.findMany({
    where: { characterId },
    orderBy: [{ kind: "asc" }, { key: "asc" }],
  });

  const techniques = await prisma.innateTechnique.findMany({
    where: { characterId },
    orderBy: { id: "asc" },
  });

  return {
    props: {
      characterId,
      initial: {
        character: JSON.parse(JSON.stringify(character)),
        cursedStats: cursedStats
          ? JSON.parse(JSON.stringify(cursedStats))
          : null,
        domainState: domainState
          ? JSON.parse(JSON.stringify(domainState))
          : null,
        statuses: JSON.parse(JSON.stringify(statuses || [])),
        techniques: JSON.parse(JSON.stringify(techniques || [])),
      },
    },
  };
};

export default function PlayerPage({ characterId, initial }) {
  const router = useRouter();

  const [snapshot, setSnapshot] = useState(initial);
  const [hp, setHp] = useState(initial?.character || null);
  const [feed, setFeed] = useState([]);
  const [busy, setBusy] = useState(false);

  const ch = snapshot?.character || hp;

  // join socket rooms
  useEffect(() => {
    if (!characterId) return;
    socket.emit("room:join", `dice_character_${characterId}`);
    socket.emit("room:join", `portrait_character_${characterId}`);

    // HP updates
    const onHp = (data) => {
      if (Number(data.character_id) !== Number(characterId)) return;
      setHp((prev) => ({
        ...(prev || {}),
        current_hit_points: data.current_hit_points,
        max_hit_points: data.max_hit_points,
        is_dead: data.is_dead,
      }));
    };

    // Dice result feed
    const onDice = (payload) => {
      if (Number(payload.character_id) !== Number(characterId)) return;
      const lines = [];

      if (payload?.sureHit) lines.push("✅ Sure-hit ativo (Domínio)");
      if (payload?.jujutsu?.notes?.length) lines.push(...payload.jujutsu.notes);

      if (payload?.rolls?.length) {
        const r = payload.rolls.map((x) => x.rolled_number).join(", ");
        lines.push(`🎲 Rolagem: ${r}`);
      }

      if (lines.length) setFeed((f) => [...f, ...lines].slice(-50));
    };

    socket.on("update_hit_points", onHp);
    socket.on("dice_roll", onDice);

    return () => {
      socket.off("update_hit_points", onHp);
      socket.off("dice_roll", onDice);
    };
  }, [characterId]);

  // helper: refresh snapshot (cheap re-read) — você pode criar uma rota própria depois
  const refresh = useMemo(() => {
    return async () => {
      // Sem endpoint pronto, então a gente só atualiza “via ações” por enquanto.
      // Depois eu te passo um GET /player/:id/snapshot pra isso ficar perfeito.
      return;
    };
  }, []);

  if (!characterId || !initial) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-white/70">
          Personagem não encontrado.{" "}
          <button
            className="underline text-white"
            onClick={() => router.push("/play")}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  async function doRoll({ max_number, times, jujutsu }) {
    setBusy(true);
    try {
      const payload = await postJSON("/roll", {
        character_id: characterId,
        max_number,
        times,
        jujutsu: jujutsu || null,
      });

      // feed local (socket também vai disparar, mas aqui já dá resposta imediata)
      if (payload?.jujutsu?.notes?.length)
        setFeed((f) => [...f, ...payload.jujutsu.notes].slice(-50));

      // se quiser: atualizar cursedStats local com o que veio
      // (se seu /roll estiver retornando cursedStatsAfter, plugue aqui)
      await refresh();
      return payload;
    } finally {
      setBusy(false);
    }
  }

  async function doReinforce(intensity) {
    return doRoll({
      max_number: 20,
      times: 1,
      jujutsu: { type: "reinforce", intensity },
    });
  }

  async function doBoost(value) {
    return doRoll({
      max_number: 20,
      times: 1,
      jujutsu: { type: "emotionalBoost", value },
    });
  }

  async function doActivateDomain(type) {
    setBusy(true);
    try {
      // Ajuste esse endpoint conforme seu jujutsuRoutes
      // Ex: POST /jujutsu/domain/activate { characterId, type }
      const r = await postJSON("/jujutsu/domain/activate", {
        characterId,
        type,
      });

      if (r?.notes?.length) setFeed((f) => [...f, ...r.notes].slice(-50));

      // Atualiza domainState local
      setSnapshot((s) => ({
        ...s,
        domainState: r?.state ? r.state : s.domainState,
      }));

      return r;
    } catch (e) {
      setFeed((f) => [...f, `❌ ${e.message}`].slice(-50));
      throw e;
    } finally {
      setBusy(false);
    }
  }

  async function doUseTechnique(t) {
    // Por enquanto, sem “arena”: você precisaria escolher um alvo.
    // Vamos registrar no feed + gastar energia via /combat/resolve quando tiver target.
    setFeed((f) =>
      [...f, `🌀 Selecionou técnica: ${t.name} (custo ${t.cost} EA)`].slice(
        -50,
      ),
    );
  }

  return (
    <>
      <Head>
        <title>{ch?.name || "Jogador"} | Player</title>
      </Head>

      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-2xl font-semibold tracking-tight">
                {ch?.name}
              </div>
              <div className="text-white/60 text-sm">
                HUD do jogador • {ch?.is_dead ? "☠️ Morto" : "🟢 Vivo"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                onClick={() => router.push("/play")}
              >
                Trocar código
              </button>
              <a
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                href={`/dice/${characterId}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir Dice
              </a>
              <a
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                href={`/portrait/${characterId}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir Portrait
              </a>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <PlayerHUD
                character={hp || snapshot.character}
                cursedStats={snapshot.cursedStats}
                domainState={snapshot.domainState}
                statuses={snapshot.statuses}
              />
              <DomainPanel
                domainState={snapshot.domainState}
                onActivate={doActivateDomain}
                busy={busy}
              />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <ActionBar
                busy={busy}
                onRoll={doRoll}
                onReinforce={doReinforce}
                onEmotionalBoost={doBoost}
                onAttack={() =>
                  setFeed((f) =>
                    [
                      ...f,
                      "⚔️ Ataque (placeholder): falta escolher alvo na UI",
                    ].slice(-50),
                  )
                }
              />

              <TechniqueList
                techniques={snapshot.techniques}
                busy={busy}
                onUse={doUseTechnique}
              />

              <CombatFeed items={feed} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
