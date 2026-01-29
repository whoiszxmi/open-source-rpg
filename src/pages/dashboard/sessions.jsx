import React, { useState } from "react";
import { useRouter } from "next/router";
import { prisma } from "../../database";
import LayoutMaster from "../../components/layout/LayoutMaster";
import { postJSON } from "../../lib/api";

export async function getServerSideProps() {
  const rooms = await prisma.room.findMany({
    include: {
      owner: { select: { id: true, name: true } },
      scenario: { select: { id: true, name: true } },
      participants: {
        select: {
          id: true,
          isReady: true,
          role: true,
          character: { select: { id: true, name: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return { props: { rooms: JSON.parse(JSON.stringify(rooms)) } };
}

export default function DashboardSessions({ rooms: initialRooms }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rooms = initialRooms || [];

  async function onCreateRoom() {
    setBusy(true);
    setError("");
    try {
      const res = await postJSON("/room/create", {});
      if (res?.room?.code) {
        await router.push(`/room/${res.room.code}?master=1`);
        return;
      }
      setError("Falha ao criar a sessão.");
    } catch (err) {
      setError(err.message || "Falha ao criar a sessão.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <LayoutMaster title="Sessões">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          onClick={onCreateRoom}
          disabled={busy}
        >
          Criar sessão
        </button>
        {error ? <div className="text-sm text-red-200">{error}</div> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Nenhuma sessão criada recentemente.
          </div>
        ) : (
          rooms.map((room) => {
            const readyCount = (room.participants || []).filter(
              (p) => p.isReady,
            ).length;
            const playerCount = (room.participants || []).filter(
              (p) => p.role === "PLAYER",
            ).length;
            return (
              <div
                key={room.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Sala {room.code}</div>
                    <div className="text-xs text-white/60">
                      Status: {room.status}
                    </div>
                  </div>
                  <a
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs"
                    href={`/room/${room.code}?master=1`}
                  >
                    Abrir lobby
                  </a>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-white/60">
                  <div>
                    Participantes: {playerCount} jogadores • {readyCount} prontos
                  </div>
                  <div>
                    Mestre: {room.owner?.name ? room.owner.name : "Não definido"}
                  </div>
                  <div>
                    Cenário: {room.scenario?.name || "Sem cenário"}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {(room.participants || []).length === 0 ? (
                    <div className="text-xs text-white/50">
                      Nenhum participante conectado ainda.
                    </div>
                  ) : (
                    room.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs"
                      >
                        <span>{participant.character?.name || "?"}</span>
                        <span className="text-white/40">
                          {participant.role} •{" "}
                          {participant.isReady ? "Pronto" : "Aguardando"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </LayoutMaster>
  );
}
