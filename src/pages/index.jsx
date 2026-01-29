import React from "react";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <>
      <Head>
        <title>Open Source RPG</title>
        <title>Open Source RPG</title>
      </Head>

      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-10 text-center">
            <div className="text-3xl font-semibold tracking-tight">
              Open Source RPG
            </div>
            <div className="mt-2 text-white/60">
              Escolha seu perfil para continuar a aventura.
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/play" legacyBehavior>
              <a className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-purple-400/40 hover:bg-white/10">
                <div className="text-sm text-white/60">Jogador</div>
                <div className="mt-2 text-2xl font-semibold">Sou Jogador</div>
                <div className="mt-3 text-white/60">
                  Entre com seu código e acompanhe sua ficha em tempo real.
                </div>
                <div className="mt-6 text-purple-300 text-sm">
                  Ir para /play →
                </div>
              </a>
            </Link>

            <Link href="/dashboard" legacyBehavior>
              <a className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-emerald-400/40 hover:bg-white/10">
                <div className="text-sm text-white/60">Mestre</div>
                <div className="mt-2 text-2xl font-semibold">Sou Mestre</div>
                <div className="mt-3 text-white/60">
                  Gerencie personagens, combates e regras do sistema.
                </div>
                <div className="mt-6 text-emerald-300 text-sm">
                  Ir para /dashboard →
                </div>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
