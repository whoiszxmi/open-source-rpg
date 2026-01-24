import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Button from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { postJSON } from "../../lib/api";

export default function Play() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onEnter(e) {
    e?.preventDefault?.();
    setErr("");
    setBusy(true);

    try {
      const data = await postJSON("/api/player/enter", { access_code: code });
      router.push(`/player/${data.characterId}`);
    } catch (ex) {
      setErr(ex.message || "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Entrar | Jogador</title>
      </Head>

      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-lg px-4 py-14">
          <div className="mb-8">
            <div className="text-2xl font-semibold tracking-tight">
              Entrar como jogador
            </div>
            <div className="text-white/60 mt-2">
              Use o <span className="text-white/80">código de acesso</span> do
              seu personagem.
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="text-white/80 text-sm">Código do personagem</div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onEnter} className="space-y-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ex: X7P-4K2"
                  className="h-12 w-full rounded-2xl bg-black/30 border border-white/10 px-4 outline-none text-white placeholder:text-white/30"
                />

                {err ? <div className="text-red-200 text-sm">{err}</div> : null}

                <Button
                  disabled={busy || !code.trim()}
                  size="lg"
                  className="w-full"
                >
                  {busy ? "Entrando..." : "Entrar"}
                </Button>

                <div className="text-white/40 text-xs">
                  Dica: você também pode abrir{" "}
                  <span className="text-white/60">/dice/[id]</span> e{" "}
                  <span className="text-white/60">/portrait/[id]</span> em outra
                  aba pra overlay.
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
