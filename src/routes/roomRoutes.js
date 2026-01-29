const express = require("express");
const { prisma } = require("../database");
const { getIo } = require("../socketServer");

const router = express.Router();

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

async function fetchParticipants(roomId) {
  const participants = await prisma.roomParticipant.findMany({
    where: { roomId },
    include: { character: true },
    orderBy: { joinedAt: "asc" },
  });
  return participants.map((row) => ({
    id: row.id,
    roomId: row.roomId,
    characterId: row.characterId,
    role: row.role,
    isReady: row.isReady,
    joinedAt: row.joinedAt,
    character: {
      id: row.character.id,
      name: row.character.name,
      is_dead: row.character.is_dead,
    },
  }));
}

function emitRoomUpdate(code, payload) {
  const io = getIo();
  if (!io) return;
  io.to(`room_${code}`).emit("room:participants", payload);
}

function emitRoomStatus(code, status) {
  const io = getIo();
  if (!io) return;
  io.to(`room_${code}`).emit("room:status", { status });
}

router.post("/create", async (req, res) => {
  try {
    const { ownerCharacterId } = req.body || {};
    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.room.findUnique({ where: { code } });
      if (!exists) break;
      code = generateRoomCode();
      attempts += 1;
    }

    const room = await prisma.room.create({
      data: {
        code,
        status: "LOBBY",
        ownerId: ownerCharacterId ? Number(ownerCharacterId) : null,
      },
    });

    return res.json({ ok: true, room: { id: room.id, code: room.code, status: room.status } });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post("/join", async (req, res) => {
  try {
    const { code, characterId, role } = req.body || {};
    if (!code || !characterId) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const room = await prisma.room.findUnique({ where: { code: String(code).trim() } });
    if (!room) {
      return res.status(404).json({ ok: false, error: "room_not_found" });
    }

    if (room.status !== "LOBBY") {
      return res.status(400).json({ ok: false, error: "room_not_available" });
    }

    const participant = await prisma.roomParticipant.upsert({
      where: {
        roomId_characterId: {
          roomId: room.id,
          characterId: Number(characterId),
        },
      },
      update: {
        role: role ? String(role).toUpperCase() : "PLAYER",
        isReady: false,
      },
      create: {
        roomId: room.id,
        characterId: Number(characterId),
        role: role ? String(role).toUpperCase() : "PLAYER",
        isReady: false,
      },
    });

    const participants = await fetchParticipants(room.id);
    emitRoomUpdate(room.code, participants);

    return res.json({ ok: true, roomId: room.id, code: room.code, participant });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post("/ready", async (req, res) => {
  try {
    const { code, characterId, isReady } = req.body || {};
    if (!code || !characterId) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const room = await prisma.room.findUnique({ where: { code: String(code).trim() } });
    if (!room) {
      return res.status(404).json({ ok: false, error: "room_not_found" });
    }

    await prisma.roomParticipant.update({
      where: {
        roomId_characterId: {
          roomId: room.id,
          characterId: Number(characterId),
        },
      },
      data: { isReady: Boolean(isReady) },
    });

    const participants = await fetchParticipants(room.id);
    emitRoomUpdate(room.code, participants);

    return res.json({ ok: true });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const code = String(req.params.code || "").trim();
    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) {
      return res.status(404).json({ ok: false, error: "room_not_found" });
    }

    const participants = await fetchParticipants(room.id);
    return res.json({
      ok: true,
      room: {
        id: room.id,
        code: room.code,
        status: room.status,
        createdAt: room.createdAt,
      },
      participants,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post("/status", async (req, res) => {
  try {
    const { code, status } = req.body || {};
    if (!code || !status) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }
    const room = await prisma.room.update({
      where: { code: String(code).trim() },
      data: { status: String(status) },
    });
    emitRoomStatus(room.code, room.status);
    return res.json({ ok: true, room: { id: room.id, code: room.code, status: room.status } });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

module.exports = router;
