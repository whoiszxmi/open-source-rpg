const express = require("express");
const router = express.Router();
const { prisma } = require("../database");

const CombatStatusService = require("../services/CombatStatusService");

// helpers
function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function isNumberArray(a) {
  return Array.isArray(a) && a.every((x) => Number.isFinite(Number(x)));
}

// POST /combat/start
// body: { name?: string, participants?: number[], roomCode?: string }
router.post("/start", async (req, res) => {
  try {
    const { name, participants, roomCode } = req.body || {};
    let resolvedParticipants = Array.isArray(participants) ? participants : null;
    let roomId = null;

    if (roomCode) {
      const room = await prisma.room.findUnique({
        where: { code: String(roomCode).trim() },
        select: { id: true },
      });
      if (!room) {
        return res.status(404).json({ ok: false, error: "room_not_found" });
      }

      const rows = await prisma.roomParticipant.findMany({
        where: { roomId: room.id },
        select: { characterId: true },
      });
      resolvedParticipants = rows.map((row) => row.characterId);
      roomId = room.id;
    }

    const combat = await prisma.combat.create({
      data: {
        name: name || null,
        roomId,
        participants: resolvedParticipants || null,
        roundNumber: 1,
        turnIndex: 0,
        turnOrder: null,
        actedThisRound: [],
      },
    });
    return res.json({ ok: true, combat });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

// POST /combat/participants
// body: { combatId: number, participants: number[] }
router.post("/participants", async (req, res) => {
  try {
    const { combatId, participants } = req.body || {};
    if (
      !combatId ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return res
        .status(400)
        .json({ ok: false, error: "missing_combatId_or_participants" });
    }

    const combat = await prisma.combat.update({
      where: { id: Number(combatId) },
      data: {
        participants,
        // reset turno quando troca participantes
        turnOrder: null,
        turnIndex: 0,
        roundNumber: 1,
        actedThisRound: [],
      },
    });

    return res.json({ ok: true, combat });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

// GET /combat/state/:combatId
router.get("/state/:combatId", async (req, res) => {
  try {
    const combatId = Number(req.params.combatId);
    const combat = await prisma.combat.findUnique({
      where: { id: combatId },
      select: {
        id: true,
        name: true,
        isActive: true,
        participants: true,
        roundNumber: true,
        turnIndex: true,
        turnOrder: true,
        actedThisRound: true,
      },
    });

    if (!combat)
      return res.status(404).json({ ok: false, error: "combat_not_found" });

    const order = Array.isArray(combat.turnOrder) ? combat.turnOrder : null;
    const currentActorId = order ? order[combat.turnIndex] : null;

    return res.json({ ok: true, combat, currentActorId });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

// POST /combat/initiative
// define a ordem de turno.
// body:
// {
//   "combatId": 1,
//   "rolls": [ { "characterId": 1, "roll": 14 }, { "characterId": 2, "roll": 9 } ]
//   // ou: "autoRoll": true  -> servidor rola d20 pra cada participante
// }
router.post("/initiative", async (req, res) => {
  try {
    const body = req.body || {};
    const combatId = toInt(body.combatId, 0);
    if (!combatId)
      return res.status(400).json({ ok: false, error: "missing_combatId" });

    const combat = await prisma.combat.findUnique({
      where: { id: combatId },
      select: { id: true, participants: true },
    });
    if (!combat)
      return res.status(404).json({ ok: false, error: "combat_not_found" });

    const participants = Array.isArray(combat.participants)
      ? combat.participants
      : [];
    if (participants.length === 0) {
      return res.status(400).json({ ok: false, error: "no_participants_set" });
    }

    let rolls = [];

    if (body.autoRoll) {
      // servidor rola d20 pra cada participante
      rolls = participants.map((id) => ({
        characterId: Number(id),
        roll: 1 + Math.floor(Math.random() * 20),
      }));
    } else if (Array.isArray(body.rolls)) {
      rolls = body.rolls.map((r) => ({
        characterId: Number(r.characterId),
        roll: toInt(r.roll, 0),
      }));
    } else {
      return res
        .status(400)
        .json({ ok: false, error: "missing_rolls_or_autoRoll" });
    }

    // filtra só participantes válidos
    const rollMap = new Map();
    for (const r of rolls) {
      if (participants.includes(r.characterId) && r.roll > 0) {
        // maior roll vence (se empatar, mantém a ordem do array recebido)
        if (!rollMap.has(r.characterId)) rollMap.set(r.characterId, r.roll);
      }
    }

    // garante que todo participante tenha roll
    for (const p of participants) {
      const pid = Number(p);
      if (!rollMap.has(pid)) rollMap.set(pid, 1);
    }

    const order = [...rollMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const updated = await prisma.combat.update({
      where: { id: combatId },
      data: {
        turnOrder: order,
        turnIndex: 0,
        roundNumber: 1,
        actedThisRound: [],
      },
    });

    // log
    await prisma.combatLog.create({
      data: {
        combatId,
        actorId: order[0] || participants[0],
        targetId: null,
        action: "INITIATIVE_SET",
        payload: { rolls: Object.fromEntries(rollMap), order },
      },
    });

    return res.json({
      ok: true,
      combat: updated,
      order,
      rolls: Object.fromEntries(rollMap),
    });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

// POST /combat/next
// avança para o próximo turno. se fechar o ciclo, incrementa round e limpa actedThisRound.
// body: { combatId: 1 }
router.post("/next", async (req, res) => {
  try {
    const combatId = toInt((req.body || {}).combatId, 0);
    if (!combatId)
      return res.status(400).json({ ok: false, error: "missing_combatId" });

    const combat = await prisma.combat.findUnique({
      where: { id: combatId },
      select: {
        id: true,
        participants: true,
        turnOrder: true,
        turnIndex: true,
        roundNumber: true,
        actedThisRound: true,
      },
    });
    if (!combat)
      return res.status(404).json({ ok: false, error: "combat_not_found" });

    const order = Array.isArray(combat.turnOrder) ? combat.turnOrder : null;
    if (!order || order.length === 0) {
      return res.status(400).json({ ok: false, error: "turnOrder_not_set" });
    }

    const nextIndex = combat.turnIndex + 1;

    // fechou a rodada
    if (nextIndex >= order.length) {
      const newRound = combat.roundNumber + 1;

      // ✅ aplica tick de rodada uma vez (DOT + duração status)
      const results = [];
      for (const id of order) {
        const characterId = Number(id);
        const tick = await CombatStatusService.tickCharacter(characterId);

        await prisma.combatLog.create({
          data: {
            combatId,
            actorId: characterId,
            targetId: null,
            action: "TURN_TICK",
            payload: tick,
          },
        });

        results.push({ characterId, tick });
      }

      const updated = await prisma.combat.update({
        where: { id: combatId },
        data: {
          roundNumber: newRound,
          turnIndex: 0,
          actedThisRound: [],
        },
      });

      await prisma.combatLog.create({
        data: {
          combatId,
          actorId: order[0],
          targetId: null,
          action: "ROUND_ADVANCE",
          payload: { roundNumber: newRound },
        },
      });

      return res.json({
        ok: true,
        advanced: "ROUND",
        combat: updated,
        currentActorId: order[0],
        tickResults: results,
      });
    }

    // só avançou turno
    const updated = await prisma.combat.update({
      where: { id: combatId },
      data: { turnIndex: nextIndex },
    });

    await prisma.combatLog.create({
      data: {
        combatId,
        actorId: order[nextIndex],
        targetId: null,
        action: "TURN_ADVANCE",
        payload: { roundNumber: combat.roundNumber, turnIndex: nextIndex },
      },
    });

    return res.json({
      ok: true,
      advanced: "TURN",
      combat: updated,
      currentActorId: order[nextIndex],
    });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

// POST /combat/turn (alias do /next)
router.post("/turn", async (req, res, next) => {
  req.url = "/next";
  return router.handle(req, res, next);
});

// GET /combat/log/:combatId
router.get("/log/:combatId", async (req, res) => {
  try {
    const combatId = Number(req.params.combatId);
    const logs = await prisma.combatLog.findMany({
      where: { combatId },
      orderBy: { created_at: "asc" },
    });
    return res.json({ ok: true, combatId, logs });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

// GET /combat/participants/:combatId
// Retorna participantes com nome + hp + morto
router.get("/participants/:combatId", async (req, res) => {
  try {
    const combatId = Number(req.params.combatId);

    const combat = await prisma.combat.findUnique({
      where: { id: combatId },
      select: {
        participants: true,
        turnOrder: true,
        turnIndex: true,
        roundNumber: true,
      },
    });

    if (!combat)
      return res.status(404).json({ ok: false, error: "combat_not_found" });

    const participants = Array.isArray(combat.participants)
      ? combat.participants
      : [];
    if (participants.length === 0) {
      return res.json({
        ok: true,
        combatId,
        roundNumber: combat.roundNumber,
        turnOrder: combat.turnOrder,
        turnIndex: combat.turnIndex,
        currentActorId:
          Array.isArray(combat.turnOrder) && combat.turnOrder.length > 0
            ? combat.turnOrder[combat.turnIndex || 0]
            : null,
        participants: [],
      });
    }

    const chars = await prisma.character.findMany({
      where: { id: { in: participants.map((x) => Number(x)) } },
      select: {
        id: true,
        name: true,
        current_hit_points: true,
        max_hit_points: true,
        is_dead: true,
      },
    });

    // manter a ordem de participants
    const byId = new Map(chars.map((c) => [c.id, c]));
    const ordered = participants
      .map((id) => byId.get(Number(id)))
      .filter(Boolean);

    const order = Array.isArray(combat.turnOrder) ? combat.turnOrder : null;
    const currentActorId = order ? order[combat.turnIndex || 0] : null;

    return res.json({
      ok: true,
      combatId,
      roundNumber: combat.roundNumber,
      turnOrder: order,
      turnIndex: combat.turnIndex,
      currentActorId,
      participants: ordered,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

module.exports = router;
