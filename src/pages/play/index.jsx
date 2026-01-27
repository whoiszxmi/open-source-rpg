import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Button from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { postJSON } from "../../lib/api";
import { COOKIE_NAMES, getSessionFromRequest } from "../../lib/session";
import LayoutPlayer from "../../components/layout/LayoutPlayer";

export async function getServerSideProps({ req }) {
  const session = await getSessionFromRequest(req, COOKIE_NAMES.player);
  if (session?.characterId) {
    return {
      redirect: {
        destination: `/player/${session.characterId}`,
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function Play() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [lastCharacterId, setLastCharacterId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("rpg:lastCharacterId");
    if (stored && /^\d+$/.test(stored)) {
      setLastCharacterId(Number(stored));
    }
  }, []);

  async function onEnter(e) {
    e?.preventDefault?.();
    setErr("");
    setBusy(true);

    try {
      const data = await postJSON("/api/auth/player/login", {
        access_code: code,
      });
      if (data?.characterId) {
        localStorage.setItem(
          "rpg:lastCharacterId",
          String(data.characterId),
        );
        await router.push(`/player/${data.characterId}`);
      } else {
        setErr("Personagem não encontrado.");
      }
    } catch (ex) {
      setErr(ex.message || "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }

  async function onContinue() {
    if (!lastCharacterId) return;
    await router.push(`/player/${lastCharacterId}`);
  }

  function onResetLast() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("rpg:lastCharacterId");
    setLastCharacterId(null);
  }

  return (
    <>
      <Head>
        <title>Entrar | Jogador</title>
      </Head>

      <LayoutPlayer title="Entrar como jogador" backHref="/">
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

          {lastCharacterId ? (
            <Card className="mb-6">
              <CardHeader>
                <div className="text-white/80 text-sm">Sessão anterior</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white/60">
                  Último personagem: #{lastCharacterId}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={onContinue} size="lg">
                    Continuar
                  </Button>
                  <Button
                    onClick={onResetLast}
                    size="lg"
                    variant="ghost"
                  >
                    Trocar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <div className="text-white/80 text-sm">Código ou ID</div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onEnter} className="space-y-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ex: X7P-4K2 ou 12"
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
      </LayoutPlayer>
    </>
  );
}
