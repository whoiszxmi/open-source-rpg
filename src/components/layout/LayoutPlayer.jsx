import React from "react";
import Link from "next/link";

export default function LayoutPlayer({ title, children, backHref = "/" }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-xs text-white/50">Open Source RPG</div>
        </div>
        <Link href={backHref} legacyBehavior>
          <a className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
            Voltar
          </a>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
