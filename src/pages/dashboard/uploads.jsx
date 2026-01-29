import React, { useEffect, useState } from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";

const assetTypes = [
  "SPRITE_SHEET",
  "ANIM_JSON",
  "SCENE_BG",
  "SFX",
  "VFX",
  "ICON",
];

export default function DashboardUploads() {
  const [assets, setAssets] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("ICON");
  const [status, setStatus] = useState("");

  async function loadAssets() {
    const res = await fetch("/assets/list");
    const data = await res.json();
    setAssets(data?.assets || []);
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function onUpload(e) {
    e.preventDefault();
    if (!file) return;
    setStatus("Enviando...");
    const form = new FormData();
    form.append("file", file);
    if (name) form.append("name", name);
    form.append("type", type);
    const res = await fetch("/assets/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (data?.ok) {
      setStatus("Upload concluído.");
      setFile(null);
      setName("");
      await loadAssets();
    } else {
      setStatus(data?.error || "Falha no upload");
    }
  }

  return (
    <LayoutMaster title="Uploads & Assets">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Enviar asset</div>
        <form onSubmit={onUpload} className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do asset"
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
          >
            {assetTypes.map((assetType) => (
              <option key={assetType} value={assetType}>
                {assetType}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            Enviar
          </button>
        </form>
        {status ? <div className="mt-2 text-xs text-white/60">{status}</div> : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm font-semibold text-white">{asset.name}</div>
            <div className="text-xs text-white/60">{asset.type}</div>
            <div className="text-xs text-white/40">{asset.url}</div>
          </div>
        ))}
      </div>
    </LayoutMaster>
  );
}
