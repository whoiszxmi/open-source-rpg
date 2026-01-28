import React from "react";
import SpritePreview from "./SpritePreview";

const slotOptions = [
  { key: "baseSkinAssetId", label: "Skin base" },
  { key: "idleAnimAssetId", label: "Idle" },
  { key: "walkAnimAssetId", label: "Walk" },
  { key: "hurtAnimAssetId", label: "Hurt" },
  { key: "deathAnimAssetId", label: "Death" },
];

export default function AppearanceEditor({
  assets,
  selection,
  onChange,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {slotOptions.map((slot) => (
          <label key={slot.key} className="text-sm text-white/70 space-y-2">
            <span className="text-white/80">{slot.label}</span>
            <select
              value={selection[slot.key] || ""}
              onChange={(e) => onChange(slot.key, e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            >
              <option value="">Nenhum</option>
              {(assets || []).map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.type})
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SpritePreview label="Idle preview" />
        <SpritePreview label="Walk preview" />
        <SpritePreview label="Hurt preview" />
      </div>
    </div>
  );
}
