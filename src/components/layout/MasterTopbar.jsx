import React from "react";
import { useRouter } from "next/router";

export default function MasterTopbar({ title }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/master/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div>
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-xs text-white/50">Controle rápido do mestre</div>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
          Nova luta
        </button>
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
