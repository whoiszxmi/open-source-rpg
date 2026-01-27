import React, { useEffect, useState } from "react";
import LayoutMaster from "../../components/layout/LayoutMaster";

export default function DashboardVisualPacks() {
  const [packs, setPacks] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function loadPacks() {
    const res = await fetch("/visualpacks");
    const data = await res.json();
    setPacks(data?.packs || []);
  }

  useEffect(() => {
    loadPacks();
  }, []);

  async function onUpload(e) {
    e.preventDefault();
    if (!file) return;
    setStatus("Enviando...");
    const res = await fetch("/visualpacks/upload", {
      method: "POST",
      headers: { "Content-Type": "application/zip" },
      body: file,
    });
    const data = await res.json();
    if (data?.ok) {
      setStatus("Pack instalado com sucesso.");
      setFile(null);
      await loadPacks();
    } else {
      setStatus(data?.error || "Falha no upload");
    }
  }

  return (
    <LayoutMaster title="Visual Packs">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Upload de pack</div>
        <form onSubmit={onUpload} className="mt-3 flex flex-wrap gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
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
        {packs.map((pack) => (
          <div
            key={pack.packId}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm font-semibold text-white">{pack.name}</div>
            <div className="text-xs text-white/60">{pack.packId}</div>
            <div className="text-xs text-white/40">{pack.version}</div>
          </div>
        ))}
      </div>
    </LayoutMaster>
  );
}
