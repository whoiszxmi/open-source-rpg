import io from "socket.io-client";

const URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SOCKET_URL || "";

const socket = io(URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
});

export function joinDiceRoom(characterId) {
  if (!characterId) return;
  socket.emit("room:join", `dice_character_${characterId}`);
}

export function joinPortraitRoom(characterId) {
  if (!characterId) return;
  socket.emit("room:join", `portrait_character_${characterId}`);
}

export function joinCombatRoom(combatId) {
  if (!combatId) return;
  socket.emit("combat:join", Number(combatId));
}

export default socket;
