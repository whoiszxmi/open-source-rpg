// src/utils/socket.js
import { io } from "socket.io-client";

// Singleton global (evita múltiplas conexões no HMR do Next)
let socket;

/**
 * Retorna uma instância única do socket, somente no browser.
 * No SSR retorna null.
 */
export function getSocket() {
  if (typeof window === "undefined") return null;

  if (!socket) {
    const URL = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

    socket = io(URL, {
      transports: ["websocket", "polling"],
      withCredentials: false, // mantenha false a menos que você tenha cookies cross-site
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    // Debug opcional (pode remover depois)
    socket.on("connect", () => {
      // eslint-disable-next-line no-console
      console.log("[socket] connected:", socket.id);
    });
    socket.on("connect_error", (err) => {
      // eslint-disable-next-line no-console
      console.log("[socket] connect_error:", err?.message || err);
    });
    socket.on("disconnect", (reason) => {
      // eslint-disable-next-line no-console
      console.log("[socket] disconnected:", reason);
    });
  }

  return socket;
}

// Mantém compatibilidade com imports antigos: `import socket from ...`
const defaultSocket = (typeof window !== "undefined" ? getSocket() : null);
export default defaultSocket;

// ===== Rooms helpers =====
export function joinDiceRoom(characterId) {
  const s = getSocket();
  if (!s || !characterId) return;
  s.emit("room:join", `dice_character_${Number(characterId)}`);
}

export function joinPortraitRoom(characterId) {
  const s = getSocket();
  if (!s || !characterId) return;
  s.emit("room:join", `portrait_character_${Number(characterId)}`);
}

/**
 * ⚠️ IMPORTANTE:
 * No seu server atual NÃO existe "combat:join".
 * Você tem duas opções:
 *  A) Criar handler no server para "combat:join" (recomendado)
 *  B) Usar room:join com nome "combat_<id>" (sem criar evento novo)
 *
 * Aqui eu vou usar a opção B (não quebra nada).
 */
export function joinCombatRoom(combatId) {
  const s = getSocket();
  if (!s || !combatId) return;
  s.emit("room:join", `combat_${Number(combatId)}`);
}
