import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import socket, {
  joinCombatRoom,
  joinDiceRoom,
  joinPortraitRoom,
  joinSnapshotRoom,
} from "../../utils/socket";
import { prisma } from "../../database";
import { postJSON } from "../../lib/api";

import PlayerHUD from "../../components/player/PlayerHUD";
import ActionBar from "../../components/player/ActionBar";
import TechniqueList from "../../components/player/TechniqueList";
import DomainPanel from "../../components/player/DomainPanel";
import CombatFeed from "../../components/player/CombatFeed";
import StatsPanel from "../../components/player/StatsPanel";
import TraitsPanel from "../../components/player/TraitsPanel";
import BlackFlashPanel from "../../components/player/BlackFlashPanel";
import CombatContextPanel from "../../components/player/CombatContextPanel";
import CombatAnimationLayer from "../../components/combat/CombatAnimationLayer";
import { getPlayerSnapshot } from "../../services/SnapshotService";

export const getServerSideProps = async ({ params }) => {
  const characterId = isNaN(params.id) ? null : Number(params.id);

  if (!characterId) return { props: { characterId: null, initial: null } };

  const snapshot = await getPlayerSnapshot(prisma, characterId);

  return {
    props: {
      characterId,
      initial: snapshot ? JSON.parse(JSON.stringify(snapshot)) : null,
    },
  };
};

export default function PlayerPage({ characterId, initial }) {
  const router = useRouter();

  const [snapshot, setSnapshot] = useState(initial);
  const [feed, setFeed] = useState([]);
  const [busy, setBusy] = useState(false);
  const combatId = snapshot?.combatId || null;
  const combatState = snapshot?.combat || null;

  // ✅ alvo + técnica selecionados
  const [selectedTargetId, setSelectedTargetId] = useState(
    initial?.targets?.find((t) => !t.is_dead)?.id ||
      initial?.targets?.[0]?.id ||
      null,
  );
  const [selectedTechniqueId, setSelectedTechniqueId] = useState(null);

  const ch = snapshot?.character;

  useEffect(() => {
    if (!characterId) return;
    if (typeof window === "undefined") return;
    localStorage.setItem("rpg:lastCharacterId", String(characterId));
    localStorage.setItem("rpg:lastPlayerPath", router.asPath);
  }, [characterId, router.asPath]);

  // ✅ Refresh real
  const refresh = useCallback(async () => {
    if (!characterId) return;
    try {
      const res = await fetch(`/api/player/${characterId}/snapshot`);
      const data = await res.json();
      if (data?.ok) {
        setSnapshot(data);
      }
    } catch {
      // silencioso
    }
  }, [characterId]);

  // join rooms + listeners
  useEffect(() => {
    if (!characterId) return;

    joinDiceRoom(characterId);
    joinPortraitRoom(characterId);
    joinSnapshotRoom(characterId);
    if (combatId) joinCombatRoom(combatId);

    const onHp = (data) => {
      if (Number(data.character_id) !== Number(characterId)) return;

      setSnapshot((prev) => {
        if (!prev?.character) return prev;
        return {
          ...prev,
          character: {
            ...prev.character,
            current_hit_points: data.current_hit_points,
            max_hit_points: data.max_hit_points,
            is_dead: data.is_dead,
          },
        };
      });
    };

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

      const after = payload?.jujutsu?.cursedStatsAfter || null;
      if (after) {
        setSnapshot((prev) => ({
          ...prev,
          cursedStats: {
            ...(prev?.cursedStats || {}),
            ...after,
          },
        }));
      }
    };

    socket.on("update_hit_points", onHp);
    socket.on("dice_roll", onDice);
    socket.on("combat:update", (payload) => {
      if (!payload?.combatId || payload.combatId !== combatId) return;
      setSnapshot((prev) => ({
        ...prev,
        combat: payload.combat || prev?.combat,
        combatId: payload.combatId || prev?.combatId,
      }));
    });
    socket.on("snapshot:update", (payload) => {
      if (payload?.characterId !== characterId) return;
      refresh();
    });

    return () => {
      socket.off("update_hit_points", onHp);
      socket.off("dice_roll", onDice);
      socket.off("combat:update");
      socket.off("snapshot:update");
    };
  }, [characterId, combatId, refresh]);

  // 1 refresh ao abrir
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const targets = snapshot?.targets || [];
    if (!targets.length) {
      if (selectedTargetId != null) setSelectedTargetId(null);
      return;
    }
    if (!targets.length) return;
    const selectedExists = targets.some(
      (t) => Number(t.id) === Number(selectedTargetId),
    );
    if (!selectedExists) {
      setSelectedTargetId(
        targets.find((t) => !t.is_dead)?.id || targets[0]?.id || null,
      );
    }
  }, [snapshot?.targets, selectedTargetId]);

  if (!characterId || !initial) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-zinc-950">
        <div className="text-white/70">
          Personagem não encontrado.{" "}
          <button
            className="text-white underline"
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

      if (payload?.jujutsu?.notes?.length) {
        setFeed((f) => [...f, ...payload.jujutsu.notes].slice(-50));
      }

      const after = payload?.jujutsu?.cursedStatsAfter || null;
      if (after) {
        setSnapshot((prev) => ({
          ...prev,
          cursedStats: {
            ...(prev?.cursedStats || {}),
            ...after,
          },
        }));
      } else {
        await refresh();
      }

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
      const r = await postJSON("/jujutsu/domain/activate", {
        characterId,
        type,
      });

      if (r?.notes?.length) setFeed((f) => [...f, ...r.notes].slice(-50));

      if (r?.state) {
        setSnapshot((s) => ({
          ...s,
          domainState: r.state,
        }));
      }

      if (r?.cursedStatsAfter) {
        setSnapshot((s) => ({
          ...s,
          cursedStats: {
            ...(s?.cursedStats || {}),
            ...r.cursedStatsAfter,
          },
        }));
      }

      await refresh();
      return r;
    } catch (e) {
      setFeed((f) => [...f, `❌ ${e.message || e}`].slice(-50));
      throw e;
    } finally {
      setBusy(false);
    }
  }

  // ✅ ataque real: usa selectedTechniqueId (se tiver)
  async function doAttack({ targetId, techniqueId, jujutsu } = {}) {
    if (!combatId) {
      setFeed((f) =>
        [
          ...f,
          "❌ Nenhum combate ativo. Entre em um combate para atacar.",
        ].slice(-50),
      );
      return;
    }
    const tId = targetId ?? selectedTargetId;
    if (!tId) {
      setFeed((f) => [...f, "❌ Selecione um alvo antes de atacar."].slice(-50));
      return;
    }

    const target = (snapshot.targets || []).find((x) => Number(x.id) === Number(tId));
    const tech = (snapshot.techniques || []).find(
      (x) => Number(x.id) === Number(techniqueId ?? selectedTechniqueId),
    );

    setFeed((f) =>
      [
        ...f,
        `⚔️ Atacando ${target ? target.name : `#${tId}`} ${
          tech ? `com técnica: ${tech.name}` : "(ataque básico)"
        }`,
      ].slice(-50),
    );

    setBusy(true);
    try {
      const payload = await postJSON("/combat/resolve", {
        combatId,
        attacker_id: characterId,
        target_id: Number(tId),
        max_number: 20,
        times: 1,
        baseDamage: 5,
        techniqueId: techniqueId ? Number(techniqueId) : null,
        jujutsu: jujutsu || null,
      });

      const lines = [];
      if (payload?.sureHit) lines.push("✅ Sure-hit (Domínio)");
      if (payload?.hits != null) lines.push(`🎯 Hits: ${payload.hits}`);
      if (payload?.damageApplied != null) lines.push(`💥 Dano: ${payload.damageApplied}`);
      if (payload?.jujutsu?.notes?.length) lines.push(...payload.jujutsu.notes);

      if (lines.length) setFeed((f) => [...f, ...lines].slice(-50));

      const after = payload?.jujutsu?.cursedStatsAfter || null;
      if (after) {
        setSnapshot((prev) => ({
          ...prev,
          cursedStats: {
            ...(prev?.cursedStats || {}),
            ...after,
          },
        }));
      }

      await refresh();
      return payload;
    } catch (e) {
      setFeed((f) =>
        [...f, `❌ Falha no ataque: ${e?.message || String(e)}`].slice(-50),
      );
      throw e;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>{ch?.name || "Jogador"} | Player</title>
      </Head>

      <div className="min-h-screen text-white bg-zinc-950 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%)]">
        <div className="max-w-6xl px-4 py-8 mx-auto">
          {/* Top bar */}
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">
                {ch?.name}
              </div>
              <div className="text-sm text-white/60">
                HUD do jogador • {ch?.is_dead ? "☠️ Morto" : "🟢 Vivo"}
                {combatId ? ` • Combate #${combatId}` : " • Sem combate ativo"}
                {combatState?.roundNumber != null
                  ? ` • Rodada ${combatState.roundNumber}`
                  : ""}
                {combatState?.currentActorId
                  ? ` • Turno #${combatState.currentActorId}`
                  : ""}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-2 text-sm border rounded-xl border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-purple-400/40"
                onClick={() => router.push("/play")}
              >
                Trocar código
              </button>

              <button
                className="px-3 py-2 text-sm border rounded-xl border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-purple-400/40"
                onClick={refresh}
                disabled={busy}
                title="Atualiza HP/EA/PM/Status"
              >
                Atualizar
              </button>

              <a
                className="px-3 py-2 text-sm border rounded-xl border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-purple-400/40"
                href={`/dice/${characterId}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir Dice
              </a>

              <a
                className="px-3 py-2 text-sm border rounded-xl border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-purple-400/40"
                href={`/portrait/${characterId}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir Portrait
              </a>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <PlayerHUD
                character={snapshot.character}
                cursedStats={snapshot.cursedStats}
                domainState={snapshot.domainState}
                statuses={snapshot.statuses}
              />

              <StatsPanel
                statsPhysical={snapshot.statsPhysical}
                statsJujutsu={snapshot.statsJujutsu}
                statsMental={snapshot.statsMental}
                statsExtra={snapshot.statsExtra}
              />

              <TraitsPanel
                statsExtra={snapshot.statsExtra}
                statsJujutsu={snapshot.statsJujutsu}
                statsMental={snapshot.statsMental}
                cursedStats={snapshot.cursedStats}
                blessings={snapshot.blessings}
                curses={snapshot.curses}
              />

              <BlackFlashPanel blackFlashState={snapshot.blackFlashState} />

              <CombatContextPanel
                combat={snapshot.combat}
                combatId={combatId}
                targets={snapshot.targets}
              />

              <DomainPanel
                domainState={snapshot.domainState}
                onActivate={doActivateDomain}
                busy={busy}
              />
            </div>

            <div className="space-y-4 lg:col-span-2">
              <CombatAnimationLayer snapshot={snapshot} combat={combatState} />

              <ActionBar
                busy={busy}
                onRoll={doRoll}
                onReinforce={doReinforce}
                onEmotionalBoost={doBoost}
                onAttack={() =>
                  doAttack({
                    targetId: selectedTargetId,
                    techniqueId: selectedTechniqueId,
                  })
                }
                targets={snapshot.targets || []}
                selectedTargetId={selectedTargetId}
                onChangeTarget={setSelectedTargetId}
                combatId={combatId}
                techniques={snapshot.techniques || []}
                selectedTechniqueId={selectedTechniqueId}
                onChangeTechnique={setSelectedTechniqueId}
              />

              <TechniqueList
                techniques={snapshot.techniques}
                busy={busy}
                selectedTechniqueId={selectedTechniqueId}
                onSelect={(t) => {
                  // ✅ atualizar seleção
                  setSelectedTechniqueId(t ? t.id : null);

                  // ✅ feed bonitinho
                  if (!t) {
                    setFeed((f) =>
                      [...f, "🧼 Técnica limpa: próximo ataque será básico."].slice(-50),
                    );
                    return;
                  }

                  setFeed((f) =>
                    [
                      ...f,
                      `🌀 Técnica selecionada: ${t.name} (custo ${t.cost} EA)`,
                      "➡️ Agora clique em Atacar para usar contra o alvo selecionado.",
                    ].slice(-50),
                  );
                }}
              />


              <CombatFeed items={feed} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
