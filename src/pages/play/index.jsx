import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Button from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { postJSON } from "../../lib/api";
import { parseCookies } from "../../lib/session";
import { prisma } from "../../database";
import LayoutPlayer from "../../components/layout/LayoutPlayer";

export async function getServerSideProps({ req }) {
  const cookies = parseCookies(req?.headers?.cookie || "");
  if (cookies.psid) {
    return {
      redirect: { destination: "/play/session", permanent: false },
    };
  }

  const characters = await prisma.character.findMany({
    where: { is_npc: false },
    select: { id: true, name: true, player_name: true },
    orderBy: { name: "asc" },
  });

  return { props: { characters: JSON.parse(JSON.stringify(characters)) } };
}

export default function Play({ characters }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [lastCharacterId, setLastCharacterId] = useState(null);
  const [lastCharacterName, setLastCharacterName] = useState("");
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [tab, setTab] = useState("player");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("player_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.characterId && /^\d+$/.test(String(parsed.characterId))) {
          setLastCharacterId(Number(parsed.characterId));
          setLastCharacterName(parsed.characterName || "");
        }
      } catch {
        // ignore
      }
    }
  }, []);

  async function onEnter(e) {
    e?.preventDefault?.();
    setErr("");
    setBusy(true);

    try {
      const data = await postJSON("/api/player/login", {
        access_code: code,
      });
      if (data?.characterId) {
        localStorage.setItem(
          "player_session",
          JSON.stringify({
            characterId: data.characterId,
            characterName: characters?.find((c) => c.id === data.characterId)?.name || "",
            token: data.token,
            lastCombatId: null,
            lastScenarioId: null,
          }),
        );
        await router.push(`/player/${data.characterId}?token=${data.token}`);
      } else {
        setErr("Personagem não encontrado.");
      }
    } catch (ex) {
      setErr(ex.message || "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }

  async function onJoinRoom(e) {
    e?.preventDefault?.();
    setErr("");
    setBusy(true);
    try {
      const characterId = Number(selectedCharacterId);
      if (!roomCode || !characterId) {
        setErr("Informe o código da sala e o personagem.");
        return;
      }
      const data = await postJSON("/api/player/login", { characterId });
      if (data?.characterId) {
        localStorage.setItem(
          "player_session",
          JSON.stringify({
            characterId: data.characterId,
            characterName:
              characters?.find((c) => c.id === data.characterId)?.name || "",
            token: data.token,
            lastCombatId: null,
            lastScenarioId: null,
          }),
        );
      }
      await postJSON("/room/join", {
        code: roomCode,
        characterId,
        role: "PLAYER",
      });
      await router.push(`/room/${roomCode}`);
    } catch (ex) {
      setErr(ex.message || "Falha ao entrar na sala.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateSession() {
    setErr("");
    setBusy(true);
    try {
      const res = await postJSON("/room/create", {});
      if (res?.room?.code) {
        await router.push(`/room/${res.room.code}?master=1`);
      } else {
        setErr("Falha ao criar sessão.");
      }
    } catch (ex) {
      setErr(ex.message || "Falha ao criar sessão.");
    } finally {
      setBusy(false);
    }
  }

  async function onSelectCharacter(id) {
    setErr("");
    setBusy(true);
    try {
      const data = await postJSON("/api/player/login", { characterId: id });
      if (data?.characterId) {
        localStorage.setItem(
          "player_session",
          JSON.stringify({
            characterId: data.characterId,
            characterName: characters?.find((c) => c.id === data.characterId)?.name || "",
            token: data.token,
            lastCombatId: null,
            lastScenarioId: null,
          }),
        );
        await router.push(`/player/${data.characterId}?token=${data.token}`);
      }
    } catch (ex) {
      setErr(ex.message || "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }

  async function onContinue() {
    if (!lastCharacterId) return;
    const data = await postJSON("/api/player/login", {
      characterId: lastCharacterId,
    });
    if (data?.characterId) {
      localStorage.setItem(
        "player_session",
        JSON.stringify({
          characterId: data.characterId,
          characterName: lastCharacterName,
          token: data.token,
          lastCombatId: null,
          lastScenarioId: null,
        }),
      );
      await router.push(`/player/${data.characterId}?token=${data.token}`);
    }
  }

  function onResetLast() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("player_session");
    setLastCharacterId(null);
    setLastCharacterName("");
  }

  return (
    <>
      <Head>
        <title>Entrar | Jogador</title>
      </Head>

      <LayoutPlayer title="Entrar como jogador" backHref="/">
        <div className="mx-auto max-w-lg px-4 py-14">
          <div className="mb-6 flex gap-2">
            <button
              className={`rounded-xl border px-3 py-2 text-sm ${
                tab === "player"
                  ? "border-white/20 bg-white/10"
                  : "border-white/10 bg-white/5"
              }`}
              onClick={() => setTab("player")}
            >
              Entrar como Jogador
            </button>
            <button
              className={`rounded-xl border px-3 py-2 text-sm ${
                tab === "master"
                  ? "border-white/20 bg-white/10"
                  : "border-white/10 bg-white/5"
              }`}
              onClick={() => setTab("master")}
            >
              Entrar como Mestre
            </button>
          </div>
          <div className="mb-8">
            <div className="text-2xl font-semibold tracking-tight">
              Entrar como jogador
            </div>
            <div className="text-white/60 mt-2">
              Use o <span className="text-white/80">código de acesso</span> do
              seu personagem.
            </div>
          </div>

          {tab === "player" && lastCharacterId ? (
            <Card className="mb-6">
              <CardHeader>
                <div className="text-white/80 text-sm">Sessão anterior</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white/60">
                  Continuar como{" "}
                  {lastCharacterName || `#${lastCharacterId}`}
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

          {tab === "player" ? (
            <Card className="mb-6">
              <CardHeader>
                <div className="text-white/80 text-sm">Entrar no lobby</div>
              </CardHeader>
              <CardContent>
                <form onSubmit={onJoinRoom} className="space-y-3">
                  <input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Código da sala"
                    className="h-12 w-full rounded-2xl bg-black/30 border border-white/10 px-4 outline-none text-white placeholder:text-white/30"
                  />
                  <select
                    value={selectedCharacterId}
                    onChange={(e) => setSelectedCharacterId(e.target.value)}
                    className="h-12 w-full rounded-2xl bg-black/30 border border-white/10 px-4 outline-none text-white"
                  >
                    <option value="">Selecione um personagem</option>
                    {(characters || []).map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    disabled={busy || !roomCode || !selectedCharacterId}
                    size="lg"
                    className="w-full"
                  >
                    Entrar no lobby
                  </Button>
                </form>
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

          {tab === "player" ? (
            <Card className="mt-6">
              <CardHeader>
                <div className="text-white/80 text-sm">
                  Personagens disponíveis
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(characters || []).length === 0 ? (
                    <div className="text-sm text-white/60">
                      Nenhum personagem disponível no momento.
                    </div>
                  ) : (
                    characters.map((character) => (
                      <button
                        key={character.id}
                        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                        onClick={() => onSelectCharacter(character.id)}
                        disabled={busy}
                      >
                        <span>{character.name}</span>
                        <span className="text-xs text-white/40">
                          {character.player_name || "Jogador"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-6">
              <CardHeader>
                <div className="text-white/80 text-sm">Sessão do mestre</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white/60">
                  Crie uma sessão para abrir o lobby e convidar os jogadores.
                </div>
                <Button
                  disabled={busy}
                  size="lg"
                  className="mt-4 w-full"
                  onClick={onCreateSession}
                >
                  Criar sessão
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </LayoutPlayer>
    </>
  );
}
