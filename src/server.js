require("dotenv").config();

const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const next = require("next");
const { setIo } = require("./socketServer");

// Ajuste paths se necessário
const { prisma } = require("./database");
const { generateRandomNumber } = require("./utils");

// Jujutsu
const engine = require("./system/jujutsu/engine");
const { resolveSureHit } = require("./system/jujutsu/domainEngine");
const DomainService = require("./services/DomainService");
const RankService = require("./services/RankService");
const EnergyService = require("./services/EnergyService");
const XPService = require("./services/XPService");
const AccumulationService = require("./services/AccumulationService");
const BlackFlashService = require("./services/BlackFlashService");
const StatsService = require("./services/StatsService");
const SeedService = require("./services/SeedService");
const SnapshotService = require("./services/SnapshotService");
const statGroupsConfig = require("./config/stat-groups.json");

// Status
const CombatStatusService = require("./services/CombatStatusService");

// Routes
const jujutsuRoutes = require("./routes/jujutsuRoutes");
const statusRoutes = require("./routes/statusRoutes");
const combatRoutes = require("./routes/combatRoutes");
const visualPackRoutes = require("./routes/visualpacks/visualPackRoutes");
const appearanceRoutes = require("./routes/visualpacks/appearanceRoutes");
const sceneRoutes = require("./routes/visualpacks/sceneRoutes");
const assetsRoutes = require("./routes/assetsRoutes");
const enemyRoutes = require("./routes/enemyRoutes");
const scenarioRoutes = require("./routes/scenarioRoutes");
const roomRoutes = require("./routes/roomRoutes");

const dev = process.env.NODE_ENV !== "production";

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Rotas
app.use("/jujutsu", jujutsuRoutes);
app.use("/status", statusRoutes);
app.use("/combat", combatRoutes);
app.use("/visualpacks", visualPackRoutes);
app.use("/characters", appearanceRoutes);
app.use("/scenes", sceneRoutes);
app.use("/assets", assetsRoutes);
app.use("/enemies", enemyRoutes);
app.use("/scenarios", scenarioRoutes);
app.use("/room", roomRoutes);

app.get("/player/:id/snapshot", async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    if (!characterId) {
      return res.status(400).json({ ok: false, error: "invalid_character_id" });
    }

    const snapshot = await SnapshotService.getPlayerSnapshot(prisma, characterId);
    if (!snapshot) {
      return res.status(404).json({ ok: false, error: "character_not_found" });
    }

    return res.json(snapshot);
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/character/create", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name) {
      return res.status(400).json({ ok: false, error: "missing_name" });
    }

    const character = await prisma.character.create({
      data: {
        name: body.name,
        player_name: body.player_name || null,
        current_hit_points: toInt(body.current_hit_points, 0),
        max_hit_points: toInt(body.max_hit_points, 0),
      },
    });

    const groupEntries = Object.entries(statGroupsConfig || {});
    const createdGroups = [];

    for (const [type, keys] of groupEntries) {
      const group = await prisma.statGroup.create({
        data: {
          characterId: character.id,
          type,
          totalPoints: 0,
          rank: RankService.getRankForPoints(0),
        },
      });

      if (Array.isArray(keys) && keys.length > 0) {
        await prisma.statValue.createMany({
          data: keys.map((key) => ({
            groupId: group.id,
            key: String(key).toUpperCase(),
            value: 0,
          })),
        });
      }

      createdGroups.push(group);
    }

    await prisma.blackFlashState.create({
      data: { characterId: character.id, activeTurns: 0, nextThreshold: 20 },
    });

    return res.json({
      ok: true,
      character,
      statGroups: createdGroups,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/room/create", async (req, res) => {
  try {
    const { name } = req.body || {};
    let code = null;

    for (let i = 0; i < 5; i += 1) {
      const candidate = generateRoomCode();
      const exists = await prisma.room.findUnique({
        where: { code: candidate },
        select: { id: true },
      });
      if (!exists) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return res
        .status(500)
        .json({ ok: false, error: "code_generation_failed" });
    }

    const room = await prisma.room.create({
      data: {
        name: name || null,
        code,
        isActive: true,
      },
    });

    return res.json({ ok: true, room });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/room/join", async (req, res) => {
  try {
    const { code, characterId, role } = req.body || {};
    if (!code || !characterId) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const room = await prisma.room.findUnique({
      where: { code: String(code).trim() },
      select: { id: true, code: true, name: true, isActive: true },
    });
    if (!room || !room.isActive) {
      return res.status(404).json({ ok: false, error: "room_not_found" });
    }

    const participant = await prisma.roomParticipant.upsert({
      where: {
        roomId_characterId: {
          roomId: room.id,
          characterId: Number(characterId),
        },
      },
      update: { role: role || "PLAYER" },
      create: {
        roomId: room.id,
        characterId: Number(characterId),
        role: role || "PLAYER",
      },
    });

    return res.json({ ok: true, room, participant });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.get("/room/:code", async (req, res) => {
  try {
    const code = String(req.params.code || "").trim();
    if (!code) {
      return res.status(400).json({ ok: false, error: "missing_code" });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        participants: {
          select: { id: true, characterId: true, role: true, joinedAt: true },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ ok: false, error: "room_not_found" });
    }

    return res.json({ ok: true, room });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/room/create", async (req, res) => {
  try {
    const { name } = req.body || {};
    let code = null;

    for (let i = 0; i < 5; i += 1) {
      const candidate = generateRoomCode();
      const exists = await prisma.room.findUnique({
        where: { code: candidate },
        select: { id: true },
      });
      if (!exists) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return res
        .status(500)
        .json({ ok: false, error: "code_generation_failed" });
    }

    const room = await prisma.room.create({
      data: {
        name: name || null,
        code,
        isActive: true,
      },
    });

    return res.json({ ok: true, room });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/room/join", async (req, res) => {
  try {
    const { code, characterId, role } = req.body || {};
    if (!code || !characterId) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const room = await prisma.room.findUnique({
      where: { code: String(code).trim() },
      select: { id: true, code: true, name: true, isActive: true },
    });
    if (!room || !room.isActive) {
      return res.status(404).json({ ok: false, error: "room_not_found" });
    }

    const participant = await prisma.roomParticipant.upsert({
      where: {
        roomId_characterId: {
          roomId: room.id,
          characterId: Number(characterId),
        },
      },
      update: { role: role || "PLAYER" },
      create: {
        roomId: room.id,
        characterId: Number(characterId),
        role: role || "PLAYER",
      },
    });

    return res.json({ ok: true, room, participant });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.get("/room/:code", async (req, res) => {
  try {
    const code = String(req.params.code || "").trim();
    if (!code) {
      return res.status(400).json({ ok: false, error: "missing_code" });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        participants: {
          select: { id: true, characterId: true, role: true, joinedAt: true },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ ok: false, error: "room_not_found" });
    }

    return res.json({ ok: true, room });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/character/add-blessing", async (req, res) => {
  try {
    const { characterId, blessingKey, blessingId } = req.body || {};
    if (!characterId || (!blessingKey && !blessingId)) {
      return res
        .status(400)
        .json({ ok: false, error: "missing_character_or_blessing" });
    }

    const blessing = blessingId
      ? await prisma.blessing.findUnique({ where: { id: Number(blessingId) } })
      : await prisma.blessing.findUnique({
          where: { key: String(blessingKey) },
        });

    if (!blessing) {
      return res.status(404).json({ ok: false, error: "blessing_not_found" });
    }

    const conflict = await AccumulationService.hasConflict(
      prisma,
      characterId,
      blessing,
      "blessing",
    );
    if (conflict) {
      return res.status(400).json({ ok: false, error: "conflict_with_curse" });
    }

    const allowed = await AccumulationService.canAddBlessing(
      prisma,
      characterId,
      blessing,
    );
    if (!allowed) {
      return res.status(400).json({ ok: false, error: "accumulation_negative" });
    }

    const existing = await prisma.characterBlessing.findFirst({
      where: { characterId: Number(characterId), blessingId: blessing.id },
    });
    if (existing) {
      return res.json({ ok: true, blessing, alreadyOwned: true });
    }

    const link = await prisma.characterBlessing.create({
      data: { characterId: Number(characterId), blessingId: blessing.id },
    });

    return res.json({ ok: true, blessing, link });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/character/add-curse", async (req, res) => {
  try {
    const { characterId, curseKey, curseId } = req.body || {};
    if (!characterId || (!curseKey && !curseId)) {
      return res
        .status(400)
        .json({ ok: false, error: "missing_character_or_curse" });
    }

    const curse = curseId
      ? await prisma.curse.findUnique({ where: { id: Number(curseId) } })
      : await prisma.curse.findUnique({
          where: { key: String(curseKey) },
        });

    if (!curse) {
      return res.status(404).json({ ok: false, error: "curse_not_found" });
    }

    const conflict = await AccumulationService.hasConflict(
      prisma,
      characterId,
      curse,
      "curse",
    );
    if (conflict) {
      return res.status(400).json({ ok: false, error: "conflict_with_blessing" });
    }

    const allowed = await AccumulationService.canAddCurse(
      prisma,
      characterId,
      curse,
    );
    if (!allowed) {
      return res.status(400).json({ ok: false, error: "accumulation_negative" });
    }

    const existing = await prisma.characterCurse.findFirst({
      where: { characterId: Number(characterId), curseId: curse.id },
    });
    if (existing) {
      return res.json({ ok: true, curse, alreadyOwned: true });
    }

    const link = await prisma.characterCurse.create({
      data: { characterId: Number(characterId), curseId: curse.id },
    });

    return res.json({ ok: true, curse, link });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

app.post("/character/levelup", async (req, res) => {
  try {
    const { characterId, xpGained } = req.body || {};
    if (!characterId) {
      return res.status(400).json({ ok: false, error: "missing_characterId" });
    }

    const result = await XPService.applyXp(
      prisma,
      characterId,
      Number(xpGained || 0),
    );

    return res.json({ ok: true, ...result });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

// Next + Socket
const server = http.Server(app);
const io = socketio(server, { cors: { origin: "*" } });
setIo(io);

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// ===== Helpers =====
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

async function emitSnapshotUpdate(characterIds) {
  const ids = Array.isArray(characterIds) ? characterIds : [];
  ids.forEach((id) => {
    if (!id) return;
    io.to(`snapshot_character_${Number(id)}`).emit("snapshot:update", {
      characterId: Number(id),
    });
  });
}

async function emitSnapshotUpdate(characterIds) {
  const ids = Array.isArray(characterIds) ? characterIds : [];
  ids.forEach((id) => {
    if (!id) return;
    io.to(`snapshot_character_${Number(id)}`).emit("snapshot:update", {
      characterId: Number(id),
    });
  });
}

function pickSkillValue(character, names) {
  if (!character || !character.skills) return null;
  for (const wanted of names) {
    const found = character.skills.find(
      (cs) => cs?.skill?.name?.toLowerCase() === wanted.toLowerCase(),
    );
    if (found && found.value != null) {
      const n = toInt(found.value, NaN);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function pickAttrValue(character, names) {
  if (!character || !character.attributes) return null;
  for (const wanted of names) {
    const found = character.attributes.find(
      (ca) => ca?.attribute?.name?.toLowerCase() === wanted.toLowerCase(),
    );
    if (found && found.value != null) {
      const n = toInt(found.value, NaN);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function getDefenseScore(targetCharacter) {
  const skillDefense = pickSkillValue(targetCharacter, [
    "Defesa",
    "Defense",
    "Esquiva",
    "Dodge",
  ]);
  if (skillDefense != null) return skillDefense;

  const attrDefense = pickAttrValue(targetCharacter, [
    "Agilidade",
    "Destreza",
    "Dexterity",
  ]);
  if (attrDefense != null) return attrDefense;

  return 10;
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// Tags simples na technique.effect (opcional): "STATUS:BURN:2:3" (key:value:turns)
// Ex: "STATUS:BURN:2:3; STATUS:STUN:1:1"
function parseStatusTags(effectText) {
  const out = [];
  const txt = (effectText || "").toString();
  const parts = txt
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const p of parts) {
    const up = p.toUpperCase();
    if (!up.startsWith("STATUS:")) continue;
    const raw = p.substring("STATUS:".length).trim();
    const seg = raw.split(":").map((s) => s.trim());
    const key = (seg[0] || "").toUpperCase();
    const value = seg[1] != null ? toInt(seg[1], 1) : 1;
    const turns = seg[2] != null ? toInt(seg[2], 1) : 1;
    if (key) out.push({ key, value, turns });
  }

  return out;
}

/**
 * ✅ Avança turno automaticamente
 * - Se fechar ciclo: aplica tick 1x na rodada, round++, turnIndex=0, actedThisRound=[]
 * - Se não: turnIndex++
 * - Emite evento socket "combat:turn" para a sala combat_<id>
 */
async function advanceCombatTurn(combatId) {
  const combat = await prisma.combat.findUnique({
    where: { id: Number(combatId) },
    select: {
      turnOrder: true,
      turnIndex: true,
      roundNumber: true,
      participants: true,
      participants: true,
    },
  });

  const order = Array.isArray(combat?.turnOrder) ? combat.turnOrder : null;
  if (!order || order.length === 0) {
    return { ok: false, error: "turnOrder_not_set" };
  }

  const currIndex = Number(combat.turnIndex) || 0;
  const nextIndex = currIndex + 1;

  // Fechou rodada
  if (nextIndex >= order.length) {
    const newRound = (Number(combat.roundNumber) || 1) + 1;

    // tick 1x por rodada (DOT + duração)
    const tickResults = [];
    for (const id of order) {
      const characterId = Number(id);
      const tick = await CombatStatusService.tickCharacter(characterId);

      await prisma.combatLog.create({
        data: {
          combatId: Number(combatId),
          actorId: characterId,
          targetId: null,
          action: "TURN_TICK",
          payload: tick,
        },
      });

      tickResults.push({ characterId, tick });
    }

    const updated = await prisma.combat.update({
      where: { id: Number(combatId) },
      data: {
        roundNumber: newRound,
        turnIndex: 0,
        actedThisRound: [],
      },
    });

    await prisma.combatLog.create({
      data: {
        combatId: Number(combatId),
        actorId: Number(order[0]),
        targetId: null,
        action: "ROUND_ADVANCE",
        payload: { roundNumber: newRound },
      },
    });

    const participantIds = Array.isArray(combat.participants)
      ? combat.participants
      : order;
    io.to(`combat_${combatId}`).emit("combat:update", {
      combatId: Number(combatId),
      combat: updated,
      currentActorId: Number(order[0]),
    });
    await emitSnapshotUpdate(participantIds);

    const participantIds = Array.isArray(combat.participants)
      ? combat.participants
      : order;
    io.to(`combat_${combatId}`).emit("combat:update", {
      combatId: Number(combatId),
      combat: updated,
      currentActorId: Number(order[0]),
    });
    await emitSnapshotUpdate(participantIds);

    return {
      ok: true,
      advanced: "ROUND",
      currentActorId: Number(order[0]),
      combat: updated,
      tickResults,
    };
  }

  // Só avançou turno
  const updated = await prisma.combat.update({
    where: { id: Number(combatId) },
    data: { turnIndex: nextIndex },
  });

  await prisma.combatLog.create({
    data: {
      combatId: Number(combatId),
      actorId: Number(order[nextIndex]),
      targetId: null,
      action: "TURN_ADVANCE",
      payload: { turnIndex: nextIndex, roundNumber: combat.roundNumber },
    },
  });

  const participantIds = Array.isArray(combat.participants)
    ? combat.participants
    : order;
  io.to(`combat_${combatId}`).emit("combat:update", {
    combatId: Number(combatId),
    combat: updated,
    currentActorId: Number(order[nextIndex]),
  });
  await emitSnapshotUpdate(participantIds);

  const participantIds = Array.isArray(combat.participants)
    ? combat.participants
    : order;
  io.to(`combat_${combatId}`).emit("combat:update", {
    combatId: Number(combatId),
    combat: updated,
    currentActorId: Number(order[nextIndex]),
  });
  await emitSnapshotUpdate(participantIds);

  return {
    ok: true,
    advanced: "TURN",
    currentActorId: Number(order[nextIndex]),
    combat: updated,
    tickResults: null,
  };
}

/**
 * POST /roll
 * (rolagem segura, com bônus jujutsu e sureHit calculado se tiver target_id)
 */
app.post("/roll", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.character_id || !body.max_number) {
      return res.status(400).json({ error: "Data not Set" });
    }

    const characterId = Number(body.character_id);
    const targetId = body.target_id ? Number(body.target_id) : null;
    const maxNumber = Number(body.max_number);
    const times = body.times ? Number(body.times) : 1;

    const attacker = await prisma.character.findUnique({
      where: { id: characterId },
      include: { cursedStats: true, domainState: true },
    });

    if (!attacker)
      return res.status(400).json({ error: "Character not found" });

    let target = null;
    if (targetId) {
      target = await prisma.character.findUnique({
        where: { id: targetId },
        include: { domainState: true },
      });
    }

    let cursedStats = attacker.cursedStats;
    if (!cursedStats) {
      cursedStats = await prisma.cursedStats.create({
        data: {
          characterId,
          cursedEnergyMax: 100,
          cursedEnergy: 100,
          cursedControl: 10,
          mentalPressure: 0,
          domainUnlocked: false,
        },
      });
    }

    const jujutsu = body.jujutsu || null;
    const s = { ...cursedStats };

    let rollBonus = 0;
    const notes = [];

    if (jujutsu && jujutsu.type === "reinforce") {
      const r = engine.reinforceBody(s, jujutsu.intensity || 1);
      rollBonus += r.bonus;
      notes.push(`Reforço corporal +${r.bonus} (custo ${r.cost} EA)`);
    }

    if (jujutsu && jujutsu.type === "emotionalBoost") {
      const r = engine.emotionalBoost(s, jujutsu.value || 5);
      rollBonus += r.bonus;
      notes.push(`Boost emocional +${r.bonus} (PM +${r.pressureAdded})`);
    }

    const sure = resolveSureHit(
      attacker.domainState,
      target ? target.domainState : null,
    );
    if (sure.sureHit)
      notes.push("Sure-hit: acerto garantido pelo Domínio (Expansão)");
    else if (sure.reason === "sure_hit_cancelled")
      notes.push("Sure-hit anulado: Domínio Simples / Cesta de Palha Oca");

    const rolls = [];
    for (let i = 0; i < times; i++) {
      const base = generateRandomNumber(maxNumber);
      rolls.push({
        max_number: maxNumber,
        rolled_number: base + rollBonus,
        character_id: characterId,
      });
    }

    await prisma.roll.createMany({ data: rolls });

    if (jujutsu) {
      await prisma.cursedStats.update({
        where: { characterId },
        data: {
          cursedEnergy: s.cursedEnergy,
          cursedEnergyMax: s.cursedEnergyMax,
          cursedControl: s.cursedControl,
          mentalPressure: s.mentalPressure,
          domainUnlocked: s.domainUnlocked,
        },
      });
    }

    await DomainService.tick(characterId);
    if (targetId) await DomainService.tick(targetId);

    const payload = {
      character_id: characterId,
      target_id: targetId,
      rolls,
      sureHit: sure.sureHit,
      jujutsu: { rollBonus, notes },
    };

    io.to(`dice_character_${characterId}`).emit("dice_roll", payload);
    return res.json(payload);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
});

/**
 * POST /combat/resolve
 * + trava de turno
 * + avança turno automaticamente
 */
app.post("/combat/resolve", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.attacker_id || !body.target_id) {
      return res.status(400).json({ error: "missing_attacker_or_target" });
    }

    const attackerId = Number(body.attacker_id);
    const targetId = Number(body.target_id);
    const combatId = body.combatId ? Number(body.combatId) : null;
    const maxNumber = body.max_number ? Number(body.max_number) : 20;
    const times = body.times ? Number(body.times) : 1;
    const baseDamage = body.baseDamage != null ? Number(body.baseDamage) : 5;

    if (!combatId) {
      return res.status(400).json({
        error: "missing_combatId",
        details: "Combate inválido ou ausente.",
      });
    }

    const combat = await prisma.combat.findUnique({
      where: { id: combatId },
      select: {
        participants: true,
        turnOrder: true,
        turnIndex: true,
        actedThisRound: true,
      },
    });
    if (!combat) {
      return res.status(404).json({ error: "combat_not_found" });
    }

    const participants = Array.isArray(combat.participants)
      ? combat.participants
      : [];
    if (!participants.includes(attackerId) || !participants.includes(targetId)) {
      return res.status(400).json({ error: "combat_participant_required" });
    }

    const order = Array.isArray(combat.turnOrder) ? combat.turnOrder : null;
    if (!order || order.length === 0) {
      return res.status(400).json({ error: "turnOrder_not_set" });
    }

    const currentActorId = Number(order[Number(combat.turnIndex) || 0]);
    if (currentActorId !== attackerId) {
      return res.status(400).json({
        error: "not_your_turn",
        details: `Agora é o turno do personagem ${currentActorId}`,
        currentActorId,
      });
    }

    const acted = Array.isArray(combat.actedThisRound)
      ? combat.actedThisRound
      : [];
    if (acted.includes(attackerId)) {
      return res.status(400).json({ error: "already_acted_this_round" });
    }

    await prisma.combat.update({
      where: { id: combatId },
      data: { actedThisRound: [...acted, attackerId] },
    });

    const attacker = await prisma.character.findUnique({
      where: { id: attackerId },
      include: {
        cursedStats: true,
        domainState: true,
        skills: { include: { skill: true } },
        attributes: { include: { attribute: true } },
      },
    });
    if (!attacker) return res.status(400).json({ error: "attacker_not_found" });

    const target = await prisma.character.findUnique({
      where: { id: targetId },
      include: {
        domainState: true,
        skills: { include: { skill: true } },
        attributes: { include: { attribute: true } },
      },
    });
    if (!target) return res.status(400).json({ error: "target_not_found" });

    // status mods
    const attackerStatuses = await CombatStatusService.listStatuses(attackerId);
    const targetStatuses = await CombatStatusService.listStatuses(targetId);

    const aMods = CombatStatusService.computeModifiers(attackerStatuses);
    const tMods = CombatStatusService.computeModifiers(targetStatuses);

    if (aMods.blocksAction) {
      return res
        .status(200)
        .json({ ok: false, reason: "stunned", notes: aMods.notes });
    }
    if (aMods.blocksTechnique && body.techniqueId) {
      return res.status(400).json({ error: "tech_seal_blocks_technique" });
    }

    // cursed stats
    let cursedStats = attacker.cursedStats;
    if (!cursedStats) {
      cursedStats = await prisma.cursedStats.create({
        data: {
          characterId: attackerId,
          cursedEnergyMax: 100,
          cursedEnergy: 100,
          cursedControl: 10,
          mentalPressure: 0,
          domainUnlocked: false,
        },
      });
    }

    const jujutsu = body.jujutsu || null;
    const s = { ...cursedStats };

    let rollBonus = 0;
    const notes = [];

    const outputValue = await StatsService.getStatValue(
      prisma,
      attackerId,
      "OUTPUT",
      "JUJUTSU",
    );
    let controlValue = await StatsService.getStatValue(
      prisma,
      attackerId,
      "CONTROL",
      "JUJUTSU",
    );

    const blackFlashAttempt = await BlackFlashService.attemptBlackFlash(
      prisma,
      attackerId,
      outputValue,
    );
    let blackFlashTriggered = blackFlashAttempt.triggered;
    let blackFlashMultiplier = blackFlashAttempt.triggered
      ? blackFlashAttempt.damageMultiplier
      : 1;
    let outputMultiplier = 1;

    if ((blackFlashAttempt.state?.activeTurns || 0) > 0) {
      outputMultiplier += 1.2;
      controlValue += Math.ceil(controlValue * 0.3);
      if (blackFlashTriggered) {
        notes.push("⚡ Black Flash ativado! Dano atual ampliado.");
      } else {
        notes.push("⚡ Zona Black Flash ativa: Output +120%, Controle +30%.");
      }
    }

    // domínio
    const sure = resolveSureHit(attacker.domainState, target.domainState);
    if (sure.sureHit)
      notes.push("Sure-hit: acerto garantido pelo Domínio (Expansão)");
    else if (sure.reason === "sure_hit_cancelled")
      notes.push("Sure-hit anulado: Domínio Simples / Cesta de Palha Oca");

    // amplificação bloqueia técnica do atacante
    const attackerAmplifying =
      attacker.domainState &&
      attacker.domainState.turnsRemaining > 0 &&
      attacker.domainState.type === "AMPLIFICATION";

    if (attackerAmplifying && body.techniqueId) {
      return res.status(400).json({
        error: "amplification_blocks_technique",
        details:
          "Amplificação ativa: não pode usar técnica inata enquanto amplifica.",
      });
    }

    // buffs jujutsu
    if (jujutsu && jujutsu.type === "reinforce") {
      const r = engine.reinforceBody(s, jujutsu.intensity || 1);
      rollBonus += r.bonus;
      notes.push(`Reforço corporal +${r.bonus} (custo ${r.cost} EA)`);
    }
    if (jujutsu && jujutsu.type === "emotionalBoost") {
      const r = engine.emotionalBoost(s, jujutsu.value || 5);
      rollBonus += r.bonus;
      notes.push(`Boost emocional +${r.bonus} (PM +${r.pressureAdded})`);
    }

    // status mods (ATK)
    rollBonus += aMods.rollBonusDelta;
    notes.push(...aMods.notes);

    // técnica (opcional)
    let technique = null;
    if (body.techniqueId) {
      technique = await prisma.innateTechnique.findFirst({
        where: { id: Number(body.techniqueId), characterId: attackerId },
      });
      if (!technique)
        return res.status(400).json({ error: "technique_not_found" });

      const controlRank = RankService.getRankForPoints(controlValue);
      const finalCost = EnergyService.getFinalCost(technique.cost, controlRank);
      engine.spendCursedEnergy(s, finalCost);
      notes.push(
        `Técnica: ${technique.name} (custo ${finalCost} EA, rank ${controlRank})`,
      );
      if (technique.effect) notes.push(`Efeito: ${technique.effect}`);
    }

    // defesa do alvo + mods
    const baseDefense = getDefenseScore(target);
    const defenseScore = baseDefense + tMods.defenseDelta;
    notes.push(...tMods.notes);
    notes.push(`Defesa do alvo: ${defenseScore}`);

    // rolagens e hits
    const rolls = [];
    let hits = 0;

    for (let i = 0; i < times; i++) {
      const base = generateRandomNumber(maxNumber);
      const finalNumber = base + rollBonus;
      const hit = sure.sureHit ? true : finalNumber >= defenseScore;
      if (hit) hits++;

      rolls.push({
        max_number: maxNumber,
        rolled_number: finalNumber,
        character_id: attackerId,
        hit,
      });
    }

    // salva rolls
    await prisma.roll.createMany({
      data: rolls.map((r) => ({
        max_number: r.max_number,
        rolled_number: r.rolled_number,
        character_id: r.character_id,
      })),
    });

    // persiste cursedStats se mudou
    if (jujutsu || technique) {
      await prisma.cursedStats.update({
        where: { characterId: attackerId },
        data: {
          cursedEnergy: s.cursedEnergy,
          cursedEnergyMax: s.cursedEnergyMax,
          cursedControl: s.cursedControl,
          mentalPressure: s.mentalPressure,
          domainUnlocked: s.domainUnlocked,
        },
      });
    }

    // tick domínio (consome 1 turno por ação)
    await DomainService.tick(attackerId);
    await DomainService.tick(targetId);

    // dano
    let damageApplied = 0;
    let targetAfter = null;

    if (hits > 0) {
      const rawDamage =
        Math.max(0, Math.trunc(baseDamage)) *
        hits *
        outputMultiplier *
        blackFlashMultiplier;
      damageApplied = Math.trunc(rawDamage);
      if (outputMultiplier > 1) {
        notes.push(`Bônus de Output aplicado: x${outputMultiplier.toFixed(2)}`);
      }
      if (blackFlashMultiplier > 1) {
        notes.push(`Multiplicador Black Flash: x${blackFlashMultiplier}`);
      }

      const targetNow = await prisma.character.findUnique({
        where: { id: targetId },
        select: {
          current_hit_points: true,
          max_hit_points: true,
          is_dead: true,
        },
      });

      const newHp = clamp(
        (targetNow.current_hit_points || 0) - damageApplied,
        0,
        targetNow.max_hit_points || 0,
      );
      const dead = newHp <= 0;

      targetAfter = await prisma.character.update({
        where: { id: targetId },
        data: { current_hit_points: newHp, is_dead: dead },
      });

      // emite HP update
      io.to(`portrait_character_${targetId}`).emit("update_hit_points", {
        character_id: targetId,
        current_hit_points: targetAfter.current_hit_points,
        max_hit_points: targetAfter.max_hit_points,
        is_dead: targetAfter.is_dead,
      });
    }

    // aplicar status vindo da técnica (se tiver tags STATUS:...)
    if (technique && hits > 0) {
      const tags = parseStatusTags(technique.effect);
      for (const t of tags) {
        await CombatStatusService.applyStatus({
          characterId: targetId,
          sourceId: attackerId,
          key: t.key,
          kind: "DEBUFF",
          value: t.value,
          stacks: 1,
          turns: t.turns,
          note: `Aplicado por ${technique.name}`,
        });
        notes.push(`Status aplicado: ${t.key} (${t.turns} turnos)`);
      }
    }

    // amplificação “anula técnica no contato” (nota de regra)
    if (attackerAmplifying && hits > 0) {
      notes.push(
        "Amplificação: técnica do alvo é anulada no contato (neste hit)",
      );
    }

    // ✅ payload final (resposta + log)
    const payload = {
      ok: true,
      combatId,
      attacker_id: attackerId,
      target_id: targetId,
      sureHit: sure.sureHit,
      defenseScore,
      hits,
      damageApplied: Math.trunc(damageApplied),
      targetAfter: targetAfter
        ? {
            current_hit_points: targetAfter.current_hit_points,
            max_hit_points: targetAfter.max_hit_points,
            is_dead: targetAfter.is_dead,
          }
        : null,
      rolls,
      jujutsu: {
        rollBonus,
        notes,
        cursedStatsAfter: {
          cursedEnergy: s.cursedEnergy,
          cursedEnergyMax: s.cursedEnergyMax,
          cursedControl: s.cursedControl,
          mentalPressure: s.mentalPressure,
          domainUnlocked: s.domainUnlocked,
        },
      },
      blackFlash: {
        triggered: blackFlashTriggered,
        roll: blackFlashAttempt.roll,
        nextThreshold: blackFlashAttempt.state?.nextThreshold,
        activeTurns: blackFlashAttempt.state?.activeTurns,
      },
    };

    // emite dado pro attacker (tela Dice)
    io.to(`dice_character_${attackerId}`).emit("dice_roll", {
      character_id: attackerId,
      target_id: targetId,
      rolls: rolls.map((r) => ({
        max_number: r.max_number,
        rolled_number: r.rolled_number,
      })),
      jujutsu: { notes },
      sureHit: sure.sureHit,
    });

    // ✅ grava log, se combatId foi enviado
    if (combatId) {
      await prisma.combatLog.create({
        data: {
          combatId,
          actorId: attackerId,
          targetId,
          action: body.techniqueId ? "TECHNIQUE" : "ATTACK",
          payload,
        },
      });

      // ✅ avança turno automaticamente
      const adv = await advanceCombatTurn(combatId);
      payload.turnAdvance = adv;

      // ✅ emite evento do combate (para UI reagir)
      if (adv?.ok && adv.currentActorId) {
        io.to(`combat_${combatId}`).emit("combat:turn", {
          combatId: Number(combatId),
          currentActorId: adv.currentActorId,
          advanced: adv.advanced,
          roundNumber: adv.combat?.roundNumber,
          turnIndex: adv.combat?.turnIndex,
        });
      }

      io.to(`combat_${combatId}`).emit("log:new", payload);
      io.to(`combat_${combatId}`).emit("combat:update", {
        combatId: Number(combatId),
        combat: adv?.combat || null,
        currentActorId: adv?.currentActorId || null,
      });

      await emitSnapshotUpdate(participants);

      io.to(`combat_${combatId}`).emit("log:new", payload);
      io.to(`combat_${combatId}`).emit("combat:update", {
        combatId: Number(combatId),
        combat: adv?.combat || null,
        currentActorId: adv?.currentActorId || null,
      });

      await emitSnapshotUpdate(participants);
    }

    if (blackFlashTriggered) {
      io.to(`combat_${combatId}`).emit("black_flash_triggered", {
        combatId: Number(combatId),
        characterId: attackerId,
        roll: blackFlashAttempt.roll,
        nextThreshold: blackFlashAttempt.state?.nextThreshold,
      });
    }

    io.to(`combat_${combatId}`).emit("combat_resolved", payload);

    if (combatId) {
      io.to(`combat_${combatId}`).emit("combat:action", {
        combatId: Number(combatId),
        attackerId,
        targetId,
        action: body.techniqueId ? "TECHNIQUE" : "ATTACK",
        techniqueId: body.techniqueId || null,
        techniqueKey: body.techniqueKey || null,
        hits,
        damageApplied: Math.trunc(damageApplied),
        createdAt: Date.now(),
      });
    }

    if (combatId) {
      io.to(`combat_${combatId}`).emit("combat:action", {
        combatId: Number(combatId),
        attackerId,
        targetId,
        action: body.techniqueId ? "TECHNIQUE" : "ATTACK",
        techniqueId: body.techniqueId || null,
        techniqueKey: body.techniqueKey || null,
        hits,
        damageApplied: Math.trunc(damageApplied),
        createdAt: Date.now(),
      });
    }

    if (!blackFlashTriggered) {
      await BlackFlashService.tickTurn(prisma, attackerId);
    }

    return res.json(payload);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
});

// Socket handlers
io.on("connect", (socket) => {
  socket.on("room:join", (roomName) => socket.join(roomName));

  // ✅ sala do combate (pra receber "combat:turn")
  socket.on("combat:join", (combatId) => {
    if (!combatId) return;
    socket.join(`combat_${Number(combatId)}`);
  });

  socket.on("snapshot:join", (characterId) => {
    if (!characterId) return;
    socket.join(`snapshot_character_${Number(characterId)}`);
  });

  socket.on("snapshot:join", (characterId) => {
    if (!characterId) return;
    socket.join(`snapshot_character_${Number(characterId)}`);
  });

  socket.on("update_hit_points", (data) => {
    io.to(`portrait_character_${data.character_id}`).emit(
      "update_hit_points",
      data,
    );
  });

  // Não aceite "dice_roll" vindo do cliente (evita forjar dado)
});

// Next handler
nextApp.prepare().then(() => {
  SeedService.ensureBlessingsAndCurses(prisma).catch((e) => {
    console.error("[Seed] Failed to sync blessings/curses:", e);
  });
  SeedService.ensureBaseVisualPack(prisma).catch((e) => {
    console.error("[Seed] Failed to sync base visual pack:", e);
  });
  SeedService.ensureBaseVisualPack(prisma).catch((e) => {
    console.error("[Seed] Failed to sync base visual pack:", e);
  });

  app.all("*", (req, res) => nextHandler(req, res));

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(
      "[Server] Successfully started on port",
      process.env.PORT || 3000,
    );
  });
});
