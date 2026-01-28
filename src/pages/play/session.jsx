import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LayoutPlayer from "../../components/layout/LayoutPlayer";

export default function PlaySession() {
  const router = useRouter();
  const [status, setStatus] = useState("Carregando sessão...");

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/play/me");
        const data = await res.json();
        if (data?.session?.characterId) {
          await router.replace(`/player/${data.session.characterId}`);
          return;
        }
      } catch {
        // ignore
      }
      setStatus("Sessão não encontrada. Volte para /play.");
      await router.replace("/play");
    }

    loadSession();
  }, [router]);

  return (
    <LayoutPlayer title="Sessão">
      <div className="mx-auto max-w-lg px-4 py-14 text-center text-white/70">
        {status}
      </div>
    </LayoutPlayer>
  );
}
