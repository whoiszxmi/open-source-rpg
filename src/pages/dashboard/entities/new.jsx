import React, { useState } from "react";
import { postJSON } from "../../../lib/api";
import LayoutMaster from "../../../components/layout/LayoutMaster";

export default function NewEnemy() {
  const [name, setName] = useState("");
  const [maxHp, setMaxHp] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    try {
      const payload = await postJSON("/api/entities/enemy/create", {
        name,
        max_hit_points: maxHp,
        current_hit_points: maxHp,
      });
      if (payload?.characterId) {
        setStatus(`Inimigo criado (#${payload.characterId}).`);
        setName("");
        setMaxHp("");
      } else {
        setStatus("Falha ao criar inimigo.");
      }
    } catch (ex) {
      setStatus(ex.message || "Falha ao criar inimigo.");
    }
  }

  return (
    <LayoutMaster title="Novo inimigo">
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do inimigo"
            className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
          />
          <input
            value={maxHp}
            onChange={(e) => setMaxHp(e.target.value)}
            placeholder="HP máximo"
            className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
        >
          Criar inimigo
        </button>

        {status ? <div className="text-sm text-white/60">{status}</div> : null}
      </form>
    </LayoutMaster>
  );
}
