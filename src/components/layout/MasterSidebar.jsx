import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/characters", label: "Personagens" },
  { href: "/dashboard/entities", label: "Inimigos" },
  { href: "/dashboard/scenarios", label: "Cenários" },
  { href: "/dashboard/combat/new", label: "Novo Combate" },
  { href: "/dashboard/combat", label: "Combates Ativos" },
  { href: "/dashboard/sessions", label: "Sessões" },
  { href: "/dashboard/uploads", label: "Uploads/Assets" },
  { href: "/dashboard/blessings", label: "Bênçãos & Maldições" },
  { href: "/dashboard/visualpacks", label: "Visual Packs" },
  { href: "/dashboard/rules", label: "Regras" },
  { href: "/dashboard/settings", label: "Configurações" },
];

export default function MasterSidebar() {
  const router = useRouter();

  return (
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
  );
}
