import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LayoutMaster from "../../../../components/layout/LayoutMaster";

export default function AppearanceEditor() {
  const router = useRouter();
  const { id } = router.query;
  const [appearance, setAppearance] = useState(null);
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    if (!id) return;
    fetch(`/characters/${id}/appearance`)
      .then((res) => res.json())
      .then((data) => setAppearance(data.appearance || null));
    fetch("/visualpacks")
      .then((res) => res.json())
      .then((data) => setPacks(data.packs || []));
  }, [id]);

  async function onSave() {
    await fetch(`/characters/${id}/appearance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appearance || {}),
    });
  }

  return (
    <LayoutMaster title="Aparência">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Aparência do personagem</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-xs text-white/60">
            Pack
            <select
              className="mt-1 w-full rounded-lg bg-black/30 p-2 text-white"
              value={appearance?.packId || ""}
              onChange={(e) =>
                setAppearance((prev) => ({ ...prev, packId: e.target.value }))
              }
            >
              <option value="">Sem pack</option>
              {packs.map((pack) => (
                <option key={pack.packId} value={pack.packId}>
                  {pack.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/60">
            Skin key
            <input
              className="mt-1 w-full rounded-lg bg-black/30 p-2 text-white"
              value={appearance?.skinKey || "default"}
              onChange={(e) =>
                setAppearance((prev) => ({ ...prev, skinKey: e.target.value }))
              }
            />
          </label>
        </div>
        <button
          onClick={onSave}
          className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
        >
          Salvar
        </button>
      </div>
    </LayoutMaster>
  );
}
