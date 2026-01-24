import React from "react";

export default function TechniqueSelector({
  techniques = [],
  selectedTechniqueId,
  onChange,
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-white/60">Técnica</div>
      <select
        className="w-full h-10 px-3 text-white border outline-none rounded-xl bg-black/30 border-white/10"
        value={selectedTechniqueId ?? ""}
        onChange={(e) =>
          onChange?.(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Ataque básico</option>
        {techniques.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} (EA {t.cost})
          </option>
        ))}
      </select>
    </div>
  );
}
