import React from "react";

export default function RoomControls({
  isReady,
  onToggleReady,
  isMaster,
  canStart,
  onStartCombat,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {!isMaster ? (
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          onClick={onToggleReady}
        >
          {isReady ? "Cancelar pronto" : "Estou pronto"}
        </button>
      ) : null}
      {isMaster ? (
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          onClick={onStartCombat}
          disabled={!canStart}
        >
          Iniciar combate
        </button>
      ) : null}
    </div>
  );
}
