import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import socket, { joinCombatRoom } from "../../utils/socket";

export default function CombatPage() {
  const router = useRouter();
  const combatId = useMemo(() => Number(router.query.id), [router.query.id]);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [roundNumber, setRoundNumber] = useState(null);
  const [currentActorId, setCurrentActorId] = useState(null);
  const [participants, setParticipants] = useState([]);

  const [myId, setMyId] = useState(null);
  const [targetId, setTargetId] = useState(null);

  const isMyTurn =
    myId && currentActorId && Number(myId) === Number(currentActorId);

  async function loadParticipants() {
    if (!combatId) return;
    setError("");
    setLoading(true);
    try {
      const r = await fetch(`/combat/participants/${combatId}`);
      const data = await r.json();
      if (!data?.ok) {
        setError(data?.error || "Falha ao carregar participantes");
        return;
      }

      setParticipants(
        Array.isArray(data.participants) ? data.participants : [],
      );
      setRoundNumber(data.roundNumber ?? null);
      setCurrentActorId(data.currentActorId ?? null);

      // defaults
      if (!myId && data.participants?.[0]?.id) setMyId(data.participants[0].id);
      if (!targetId && data.participants?.[1]?.id)
        setTargetId(data.participants[1].id);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!combatId) return;

    joinCombatRoom(combatId);
    loadParticipants();

    const onTurn = (data) => {
      if (Number(data?.combatId) !== Number(combatId)) return;
      setCurrentActorId(Number(data.currentActorId));
      if (data.roundNumber != null) setRoundNumber(data.roundNumber);
      // atualiza HP/status quando o turno muda (prático)
      loadParticipants();
    };

    socket.on("combat:turn", onTurn);
    return () => socket.off("combat:turn", onTurn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatId]);

  async function doAttack() {
    setError("");
    if (!combatId) return setError("combatId inválido.");
    if (!myId) return setError("Selecione 'EU'.");
    if (!targetId) return setError("Selecione um alvo.");
    if (Number(myId) === Number(targetId))
      return setError("Você não pode atacar você mesmo.");
    if (!isMyTurn)
      return setError(`Não é seu turno. Turno atual: ${currentActorId}`);

    setBusy(true);
    try {
      const r = await fetch("/combat/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          combatId,
          attacker_id: Number(myId),
          target_id: Number(targetId),
          max_number: 20,
          times: 1,
          baseDamage: 5,
        }),
      });

      const data = await r.json();
      if (!r.ok || data?.error) {
        setError(data?.details || data?.error || "Erro no ataque");
      }

      // Atualiza UI (o socket também chega, mas isso deixa “instantâneo”)
      if (data?.turnAdvance?.ok && data.turnAdvance.currentActorId) {
        setCurrentActorId(Number(data.turnAdvance.currentActorId));
        if (data.turnAdvance?.combat?.roundNumber != null)
          setRoundNumber(data.turnAdvance.combat.roundNumber);
      }

      await loadParticipants();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  const my = participants.find((p) => Number(p.id) === Number(myId));
  const target = participants.find((p) => Number(p.id) === Number(targetId));

  return (
    <React.Fragment>
      <Head>
        <title>Combate {combatId || ""} | RPG</title>
      </Head>

      <div style={{ padding: 16, fontFamily: "Arial, sans-serif" }}>
        <h2>Combate {combatId || "—"}</h2>

        <div style={{ marginBottom: 10 }}>
          <b>Rodada:</b> {roundNumber ?? "—"} <br />
          <b>Turno atual:</b> {currentActorId ? `#${currentActorId}` : "—"}{" "}
          <br />
          <b>É meu turno?</b> {isMyTurn ? "SIM" : "NÃO"}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 320 }}>
            <h3>Participantes</h3>

            <button
              onClick={loadParticipants}
              disabled={!combatId || loading || busy}
            >
              {loading ? "Carregando..." : "Recarregar"}
            </button>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {participants.map((p) => {
                const isCurrent = Number(p.id) === Number(currentActorId);
                const isMe = Number(p.id) === Number(myId);
                const isTarget = Number(p.id) === Number(targetId);

                return (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #ccc",
                      padding: 10,
                      borderRadius: 8,
                      background: isCurrent ? "#e8f4ff" : "#fff",
                      opacity: p.is_dead ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <b>
                        #{p.id} {p.name} {p.is_dead ? "(MORTO)" : ""}
                      </b>
                      {isCurrent ? <span>🎯 TURNO</span> : null}
                    </div>

                    <div>
                      HP: {p.current_hit_points}/{p.max_hit_points}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => setMyId(p.id)}
                        disabled={busy}
                        style={{
                          fontWeight: isMe ? "bold" : "normal",
                        }}
                      >
                        {isMe ? "EU ✅" : "Definir EU"}
                      </button>

                      <button
                        onClick={() => setTargetId(p.id)}
                        disabled={busy}
                        style={{
                          fontWeight: isTarget ? "bold" : "normal",
                        }}
                      >
                        {isTarget ? "ALVO ✅" : "Definir ALVO"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {participants.length === 0 ? (
                <div>Nenhum participante.</div>
              ) : null}
            </div>
          </div>

          <div style={{ minWidth: 320 }}>
            <h3>Ação</h3>

            <div style={{ marginBottom: 10 }}>
              <div>
                <b>EU:</b> {my ? `#${my.id} ${my.name}` : "—"}
              </div>
              <div>
                <b>ALVO:</b> {target ? `#${target.id} ${target.name}` : "—"}
              </div>
            </div>

            <button
              disabled={!isMyTurn || busy || !myId || !targetId}
              onClick={doAttack}
            >
              {busy ? "Executando..." : "Atacar"}
            </button>

            {!isMyTurn && currentActorId ? (
              <div style={{ marginTop: 8, opacity: 0.7 }}>
                Aguarde: agora é o turno de #{currentActorId}.
              </div>
            ) : null}

            {error ? (
              <div
                style={{ marginTop: 12, padding: 10, background: "#ffe6e6" }}
              >
                <b>Erro:</b> {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
