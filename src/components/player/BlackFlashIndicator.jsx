import React from "react";

export default function BlackFlashIndicator({ state }) {
  if (!state) return null;
  const active = (state.activeTurns || 0) > 0;
  return (
    <div className="text-xs text-white/70">
      Black Flash: {active ? `ativo (${state.activeTurns} turnos)` : "inativo"} •
      Próx. limiar: {state.nextThreshold}
    </div>
  );
}
