import React from "react";

export default function StatusList({ statuses = [] }) {
  if (!statuses.length) {
    return <div className="text-xs text-white/50">Sem status ativos.</div>;
  }

  return (
    <ul className="space-y-1 text-xs text-white/70">
      {statuses.map((st) => (
        <li key={st.id} className="flex items-center justify-between">
          <span>
            {st.key} ({st.kind})
          </span>
          <span className="text-white/50">{st.turnsRemaining}t</span>
        </li>
      ))}
    </ul>
  );
}
