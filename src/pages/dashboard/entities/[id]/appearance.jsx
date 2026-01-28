import React, { useState } from "react";
import { prisma } from "../../../../database";
import { postJSON } from "../../../../lib/api";
import LayoutMaster from "../../../../components/layout/LayoutMaster";
import AppearanceEditor from "../../../../components/visual/AppearanceEditor";

const slotKeys = [
  "baseSkinAssetId",
  "idleAnimAssetId",
  "walkAnimAssetId",
  "hurtAnimAssetId",
  "deathAnimAssetId",
];

export async function getServerSideProps({ params }) {
  const enemyId = Number(params.id);
  if (!enemyId || Number.isNaN(enemyId)) {
    return { notFound: true };
  }

  const [enemy, assets] = await Promise.all([
    prisma.enemyTemplate.findUnique({
      where: { id: enemyId },
      select: { id: true, name: true, appearanceProfileId: true },
    }),
    prisma.asset.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!enemy) {
    return { notFound: true };
  }

  return {
    props: {
      enemy: JSON.parse(JSON.stringify(enemy)),
      assets: JSON.parse(JSON.stringify(assets)),
    },
  };
}

export default function EnemyAppearance({ enemy, assets }) {
  const [selection, setSelection] = useState({});
  const [status, setStatus] = useState("");

  function handleChange(slot, value) {
    setSelection((prev) => ({ ...prev, [slot]: value ? Number(value) : "" }));
  }

  async function onSave(e) {
    e.preventDefault();
    setStatus("");
    try {
      for (const slot of slotKeys) {
        if (!selection[slot]) continue;
        await postJSON("/assets/attach", {
          ownerType: "ENEMY",
          ownerId: enemy.id,
          slot,
          assetId: Number(selection[slot]),
        });
      }
      setStatus("Aparência atualizada.");
    } catch (ex) {
      setStatus(ex.message || "Falha ao salvar aparência.");
    }
  }

  return (
    <LayoutMaster title={`Aparência • ${enemy.name}`}>
      <form onSubmit={onSave} className="space-y-4">
        <AppearanceEditor
          assets={assets}
          selection={selection}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
        >
          Salvar aparência
        </button>
        {status ? <div className="text-sm text-white/60">{status}</div> : null}
      </form>
    </LayoutMaster>
  );
}
