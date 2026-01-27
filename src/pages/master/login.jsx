import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Button from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { postJSON } from "../../lib/api";
import { COOKIE_NAMES, getSessionFromRequest } from "../../lib/session";
import LayoutPlayer from "../../components/layout/LayoutPlayer";

export async function getServerSideProps({ req }) {
  const session = await getSessionFromRequest(req, COOKIE_NAMES.master);
  if (session?.ok) {
    return {
      redirect: { destination: "/dashboard/overview", permanent: false },
    };
  }

  return { props: {} };
}

export default function MasterLogin() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e?.preventDefault?.();
    setErr("");
    setBusy(true);

    try {
      await postJSON("/api/auth/master/login", { key });
      router.push("/dashboard/overview");
    } catch (ex) {
      setErr(ex.message || "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Login Mestre</title>
      </Head>

      <LayoutPlayer title="Login mestre" backHref="/">
        <div className="mx-auto max-w-lg px-4 py-16">
          <div className="mb-8">
            <div className="text-2xl font-semibold tracking-tight">
              Acesso do mestre
            </div>
            <div className="text-white/60 mt-2">
              Use a chave mestre configurada no ambiente.
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="text-white/80 text-sm">Chave do mestre</div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-3">
                <input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="MASTER_KEY"
                  className="h-12 w-full rounded-2xl bg-black/30 border border-white/10 px-4 outline-none text-white placeholder:text-white/30"
                />

                {err ? <div className="text-red-200 text-sm">{err}</div> : null}

                <Button disabled={busy || !key.trim()} size="lg">
                  {busy ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </LayoutPlayer>
    </>
  );
}
