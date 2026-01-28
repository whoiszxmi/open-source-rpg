import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/dashboard/overview", label: "Visão geral" },
  { href: "/dashboard/characters", label: "Personagens" },
  { href: "/dashboard/combats", label: "Combates" },
  { href: "/dashboard/blessings", label: "Bênçãos & Maldições" },
  { href: "/dashboard/rules", label: "Regras" },
  { href: "/dashboard/settings", label: "Configurações" },
];

export default function LayoutMaster({ title, children }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/master/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-shrink-0 border-r border-white/10 bg-black/30 px-4 py-6 lg:block">
          <div className="text-lg font-semibold">Painel do Mestre</div>
          <div className="mt-1 text-xs text-white/50">Open Source RPG</div>
          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    router.asPath.startsWith(item.href)
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <div className="text-xl font-semibold">{title}</div>
              <div className="text-xs text-white/50">
                Controle rápido do mestre
              </div>
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

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
