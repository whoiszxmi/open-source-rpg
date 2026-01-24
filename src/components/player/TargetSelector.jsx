import React from "react";

export default function TargetSelector({
  targets = [],
  selectedTargetId,
  onChange,
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-white/60">Alvo</div>
      <select
        className="w-full h-10 px-3 text-white border outline-none rounded-xl bg-black/30 border-white/10"
        value={selectedTargetId ?? ""}
        onChange={(e) =>
          onChange?.(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Selecione</option>
        {targets.map((t) => (
          <option key={t.id} value={t.id} disabled={t.is_dead}>
            {t.name} {t.is_dead ? "☠️" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
