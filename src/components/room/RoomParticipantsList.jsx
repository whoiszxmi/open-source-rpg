import React from "react";

export default function RoomParticipantsList({ participants }) {
  return (
    <div className="space-y-2">
      {(participants || []).length === 0 ? (
        <div className="text-sm text-white/60">Nenhum participante ainda.</div>
      ) : (
        participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            <div>
              <div className="text-white/80">{participant.character?.name || "?"}</div>
              <div className="text-xs text-white/40">
                {participant.role} • {participant.isReady ? "Pronto" : "Aguardando"}
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                participant.isReady
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {participant.isReady ? "OK" : "..."}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
