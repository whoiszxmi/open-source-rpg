import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { prisma } from "@/database";
import LayoutPlayer from "@/components/layout/LayoutPlayer";
import RoomParticipantsList from "@/components/room/RoomParticipantsList";
import RoomControls from "@/components/room/RoomControls";
import { postJSON } from "@/lib/api";
import socket, { joinLobbyRoom } from "@/utils/socket";

export async function getServerSideProps({ params }) {
  const code = String(params.code || "").trim();
  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      participants: {
        include: { character: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!room) {
    return { notFound: true };
  }

  const participants = room.participants.map((row) => ({
    id: row.id,
    roomId: row.roomId,
    characterId: row.characterId,
    role: row.role,
    isReady: row.isReady,
    joinedAt: row.joinedAt,
    character: {
      id: row.character.id,
      name: row.character.name,
      is_dead: row.character.is_dead,
    },
  }));

  const scenarios = await prisma.scenario.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const enemies = await prisma.enemyTemplate.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return {
    props: {
      room: JSON.parse(
        JSON.stringify({
          id: room.id,
          code: room.code,
          status: room.status,
          createdAt: room.createdAt,
        }),
      ),
      participants: JSON.parse(JSON.stringify(participants)),
      scenarios: JSON.parse(JSON.stringify(scenarios)),
      enemies: JSON.parse(JSON.stringify(enemies)),
    },
  };
}

export default function RoomLobby({ room, participants: initial, scenarios, enemies }) {
  const router = useRouter();
  const [participants, setParticipants] = useState(initial || []);
  const [status, setStatus] = useState(room.status);
  const [scenarioId, setScenarioId] = useState("");
  const [selectedEnemies, setSelectedEnemies] = useState([]);

  const isMaster = router.query.master === "1";

  const session = useMemo(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("player_session");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  const currentParticipant = participants.find(
    (p) => Number(p.characterId) === Number(session?.characterId),
  );

  const readyCount = participants.filter((p) => p.isReady).length;
  const canStart = participants.length > 0 && readyCount > 0;

  useEffect(() => {
    joinLobbyRoom(room.code);

    socket.on("room:participants", (payload) => {
      setParticipants(payload || []);
    });

    socket.on("room:status", (payload) => {
      setStatus(payload?.status || "LOBBY");
    });

    socket.on("combat:started", (payload) => {
      if (!payload?.combatId) return;
      if (isMaster) {
        router.replace(`/dashboard?combatId=${payload.combatId}`);
        return;
      }
      if (session?.characterId) {
        const token = session?.token ? `?token=${session.token}` : "";
        router.replace(`/player/${session.characterId}${token}`);
      }
    });

    return () => {
      socket.off("room:participants");
      socket.off("room:status");
      socket.off("combat:started");
    };
  }, [room.code, router, isMaster, session?.characterId, session?.token]);

  async function onToggleReady() {
    if (!session?.characterId) return;
    await postJSON("/room/ready", {
      code: room.code,
      characterId: session.characterId,
      isReady: !currentParticipant?.isReady,
    });
  }

  async function onStartCombat() {
    await postJSON("/combat/start", {
      code: room.code,
      scenarioId: scenarioId ? Number(scenarioId) : null,
      enemies: selectedEnemies,
      players: participants
        .filter((p) => p.role === "PLAYER")
        .map((p) => p.characterId),
    });
  }

  function toggleEnemy(id) {
    if (selectedEnemies.includes(id)) {
      setSelectedEnemies(selectedEnemies.filter((e) => e !== id));
    } else {
      setSelectedEnemies([...selectedEnemies, id]);
    }
  }

  return (
    <LayoutPlayer title={`Sala ${room.code}`} backHref="/play">
      <Head>
        <title>Sala {room.code}</title>
      </Head>
      <div className="mx-auto max-w-3xl px-4 py-10 text-white">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xl font-semibold">Sala {room.code}</div>
            <div className="text-xs text-white/60">Status: {status}</div>
          </div>
          <RoomControls
            isMaster={isMaster}
            isReady={currentParticipant?.isReady}
            onToggleReady={onToggleReady}
            canStart={canStart}
            onStartCombat={onStartCombat}
          />
        </div>

        {isMaster ? (
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Cenário</div>
              <select
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
              >
                <option value="">Sem cenário</option>
                {(scenarios || []).map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Inimigos</div>
              <div className="mt-2 space-y-1 text-sm">
                {(enemies || []).length === 0 ? (
                  <div className="text-white/60">Nenhum inimigo cadastrado.</div>
                ) : (
                  enemies.map((enemy) => (
                    <label key={enemy.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEnemies.includes(enemy.id)}
                        onChange={() => toggleEnemy(enemy.id)}
                      />
                      <span>{enemy.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Participantes</div>
          <div className="mt-3">
            <RoomParticipantsList participants={participants} />
          </div>
        </div>
      </div>
    </LayoutPlayer>
  );
}
