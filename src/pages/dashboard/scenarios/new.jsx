import React, { useState } from "react";
import { prisma } from "../../../database";
import { postJSON } from "../../../lib/api";
import LayoutMaster from "../../../components/layout/LayoutMaster";

export async function getServerSideProps() {
  const assets = await prisma.asset.findMany({
    select: { id: true, name: true, type: true },
    orderBy: { createdAt: "desc" },
  });

  return { props: { assets: JSON.parse(JSON.stringify(assets)) } };
}

export default function NewScenario({ assets }) {
  const [name, setName] = useState("");
  const [backgroundAssetId, setBackgroundAssetId] = useState("");
  const [musicAssetId, setMusicAssetId] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    try {
      const payload = await postJSON("/api/scenarios/create", {
        name,
        backgroundAssetId: backgroundAssetId ? Number(backgroundAssetId) : null,
        musicAssetId: musicAssetId ? Number(musicAssetId) : null,
      });
      if (payload?.scene?.id) {
        setStatus(`Cenário criado (#${payload.scene.id}).`);
        setName("");
        setBackgroundAssetId("");
        setMusicAssetId("");
      } else {
        setStatus("Falha ao criar cenário.");
      }
    } catch (ex) {
      setStatus(ex.message || "Falha ao criar cenário.");
    }
  }

  const backgroundAssets = (assets || []).filter(
    (asset) => asset.type === "BACKGROUND",
  );
  const musicAssets = (assets || []).filter((asset) => asset.type === "MUSIC");

  return (
    <LayoutMaster title="Novo cenário">
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do cenário"
            className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
          />
          <select
            value={backgroundAssetId}
            onChange={(e) => setBackgroundAssetId(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
          >
            <option value="">Asset de fundo (opcional)</option>
            {backgroundAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} (#{asset.id})
              </option>
            ))}
          </select>
          <select
            value={musicAssetId}
            onChange={(e) => setMusicAssetId(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
          >
            <option value="">Asset de música (opcional)</option>
            {musicAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} (#{asset.id})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
        >
          Criar cenário
        </button>

        {status ? <div className="text-sm text-white/60">{status}</div> : null}
      </form>
    </LayoutMaster>
  );
}
